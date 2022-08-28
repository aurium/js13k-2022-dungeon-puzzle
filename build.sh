#!/bin/bash -e

PROJ_DIR=$PWD
SRC_DIR=$PROJ_DIR/game
PATH="$PATH:$PROJ_DIR/node_modules/.bin/"

NOW=$(date +%F_%T)

test "$DEBUG" = "true" && DEV_MODE=true
test -n "$DEV" || DEV=false
test -n "$DEV" -a -z "$DEV_MODE" && DEV_MODE=$DEV
test "$DEV_MODE" = "on" && DEV_MODE=true
test "$DEV_MODE" = "off" && DEV_MODE=false
$DEV_MODE && echo '>> Allow debuging' || echo '>> Remove debuging'

test -z "$DIST" && DIST=dist
echo "Building into $DIST"

test -e "$DIST" && rm -r "$DIST"
mkdir "$DIST"
cd "$DIST"

SRC_HTMLS=$SRC_DIR/*.html

sed -r 's!(<link [^>]+>)!\n\1\n!g' $SRC_HTMLS |
grep 'rel="stylesheet"' $SRC_HTMLS  |
sed -r 's/.* href="([^"]+)".*/\1/'  |
xargs -I '{}' cat "$SRC_DIR/{}" > style.css

sed -r 's!(<script [^>]+>)!\n\1\n!g' $SRC_HTMLS |
egrep '<script[^>]* src="'           |
egrep -v '<script[^>]* src="https?:' |
sed -r 's!.* src="([^"]+)".*!'"$SRC_DIR"'/\1!' |
xargs concat-with-sourcemaps -v -o game.full.js

for html in $SRC_HTMLS; do
  echo ">> Writing \"$html\" to \"$DIST${html#$SRC_DIR}\"..."
  egrep -v 'rel="stylesheet"|<script [^d]' "$html" |
  tr -s '\n' ' ' |
  sed -r '
    s!</head>!<link rel="stylesheet" href="style.css" /></head>!;
    s!</body>!<script src="game.js"></script></body>!;
    s!\s+! !g;
    s!> <!><!g;
    s/<!--[^>]*-->//
  ' > "${html#$SRC_DIR/}"
done

sed -ri "s/#BUILD#/$NOW/g" *

if ! $DEV_MODE; then
  # Accept some levels of nested parentheses inside `log()`.
  recursiveParentheses="([^()]*\([^()]*\)[^()]*)"
  recursiveParentheses="(\([^()]*$recursiveParentheses*[^()]*\))"
  recursiveParentheses="(\([^()]*$recursiveParentheses*[^()]*\))"
  recursiveParentheses="(\([^()]*$recursiveParentheses*[^()]*\))"
  # Cleanup debug snippets
  sed -ri "
    s!(^|[^_a-zA-Z0-9])log\([^()]*$recursiveParentheses*[^()]*\)!\1void(0)!g;
    s!.*//\s*DEBUG!// EX DEBUG!;
  " *.js
  sed -ri "
    s!/\*\s*(INI\s+DEBUG|DEBUG\s+INI).*\*/!/* EX MULTILINE DEBUG!g;
  " *.{js,css}
  sed -ri "
    s/.*<!--\s*DEBUG\s*-->.*//;
  " *.html
fi

terser_args=(
  --compress
  --output game.js
)
if $DEV_MODE; then
  terser_args=(
    "${terser_args[@]}"
    --source-map content=game.full.js.map,url=game.js.map
  )
else
  terser_args=(
  "${terser_args[@]}"
  --mangle 'toplevel,reserved=["initMap"]'
  --mangle-props regex=/_$/
  )
fi

# Minify JS
(
  $DEV_MODE            \
  && cat game.full.js  \
  || sed -r 's/const/let/' game.full.js
) |
terser "${terser_args[@]}"

rm game.full.*

# Minify CSS
CSS=$(tr -s '\n' ' ' < style.css)
echo "$CSS" | sed -r '
  s!/\*([^*]|\*[^/])*\*/!!g;
  s!; *\}!}!g;
  s! *([;,{}]) *!\1!g;
  s!\( *!(!g;
  s! *\)!)!g;
' > style.css

echo -e "\n>> Built files:"
ls -lh

if [ -z "$ZIP_PACK" ]; then
  test -n "$npm_package_name" \
  && ZIP_PACK="/tmp/${npm_package_name}_$(date +%F_%T).zip" \
  || ZIP_PACK="/tmp/$(basename "$PROJ_DIR")_$(date +%F_%T).zip"
fi
ZIP_PACK="$(realpath "$ZIP_PACK")"

test -z "$MKZIP" && MKZIP=true

if $MKZIP; then
  test -e "$ZIP_PACK" && rm "$ZIP_PACK"
  if which zip > /dev/null; then
    echo -e "\n>> Packing with zip:"
    zip -9 -r "$ZIP_PACK" *
    zip_size=$(du -b "$ZIP_PACK" | sed 's/\t.*//')
  fi

  ect_bin=$PROJ_DIR/node_modules/ect-bin/vendor/linux/ect
  if test -e $ect_bin; then
    test -e "$ZIP_PACK" && rm "$ZIP_PACK"
    chmod +x $ect_bin || true
    echo -e "\n>> Packing with ect:"
    $ect_bin -9 -zip "$ZIP_PACK" *
    ect_size=$(du -b "$ZIP_PACK" | sed 's/\t.*//')
  else
    echo "You could install ect-bin from NPM for a smaller zip size." >&2
  fi

  echo ''
  test -z "$zip_size" || echo "• zip size: $zip_size bytes"
  test -z "$ect_size" || echo "• ect size: $ect_size bytes (using it)"

  max=$((13*1024))
  if which bc > /dev/null; then
    pct="= $(echo "scale=2; 100*$ect_size/$max" | bc -l)%"
  else
    pct="≈ $(( (100 * $ect_size) / $max))%"
  fi

  if [ $ect_size -le $max ]; then
    echo -e "\e[32mThe game pakage is in the limt. $ZIP_PACK $pct\e[0m"
    exit 0
  else
    echo -e "\e[31mThe game pakage over the limt. $ZIP_PACK $pct\e[0m"
    $DEV_MODE && exit 0 || exit 1
  fi
else
  echo -e "\e[30mBuilt without zip package. Enjoy dist.\e[0m"
fi

ls -lh
ls -lh $ZIP_PACK
