ejs should be a set of different modules / tools to easily write games

ejs
=== 
provides xhr

egame
===
provides core game functionality

* event handling / keymapping
* game loops
* canvas handling

ephys
===
provides physics

* collision
* gravity
* rotation etc.
* particles

escene
===
provides scene management

* load a scene
* switch to a different scene
* draw visible objects


	egame.init({}) //returns egame

	egame.scene() //returns scene manager

	egame.loop(callback)

	egame.keymap([
		{
			keyCode: int,
			callback: function,
			mode: press|toggle,
			preventDefault: true,
		}
	])

	escene.load(dataUri);


