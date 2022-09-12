Dungeon Puzzle
==============
Created to JS13kGames Competition 2022.  
https://js13kgames.com/entries/dungeon-puzzle

Gameplay
--------

You should mount a puzzle to connect lands and build a path where your heroes will walk, fight enemies, until find and kill the final boss.

You have 10 available peaces on the left box to drag and place somewhere in the table.
When you place a piece, a new random piece will appear on the available collection, you earn gold and more warriors on each neighbor piece with the same terrain.
If no available piece matches the place you want, you can pay to replace any one bay some new random piece.

When your heroes find an enemy, they will fight, unless you change they behavior to "craven".
When attacked, an entity will bleed, so you can see how near to dead is that unity.
When you kill an enemy, you earn gold.

All entities are stupid boids. They don't understand walls, they don't calculate paths. You can't control your heroes directly. The better you can do is to click on the map point where they will be attracted, and change their behavior.

Using the top left control, you can change all your heroes behavior at once to:
* **Craven**: Will run away when see a enemy.
* **Defensive**: Will just follow the attractor and fight if an enemy gets near enough.
* **Aggressive**: Will run over any near enemy.

You can command all your wizards to cast spells, by clicking on the "Magic" control buttons.
* **Regenerate**: will give 1 life point until its original value to all heroes inside the cast radius, including the wizard itself.
* **Freeze**: will freeze all uncrown enemies in the map for some seconds.

Heroes
------

* **Warriors:** the blue dots. Can only close combat.
* **Wizards:** the white dots. Can both close combat and distant attack with fireballs. They always try to be far from enemies.

Enemies
-------
All enemies can only close combat.

* **Undead:** the greened gray dots. Comes in multiple sizes, the indicates how much life it have.
* **Generals:** the greened gray dots with the black onyx crown. They are slow, but strong.
* **The Lord's sun:** the greened gray dots with the silver crown. He is slow, but strong.
* **Lord of Death:** the greened gray dots with the emerald crown. He won't to move out his throne, nor you.

You shouldn't...
----------------
...but you can:

* **Buy time:** will roll back your clock 1 turn (one minute), for a progressive amount of gold.
* **Give up:** will end the game.


Sheet
-----

Run `addGold(<num>)` in the browser console the help your fight.


Performance
-----------

It really demands CPU because of high number of elements and filters. To solve the low FPS problem, it automatically drops the graphics quality to a simpler renderization when the FPS is bellow 7 (8 is acceptable for tis kind of game/animation).

A button will appear to allow the user to upgrade the graphics if they want, when the FPS returns to normal parameters.

On a old laptop the game performs well on firefox.

Easy mode is challenging and fun enough.
