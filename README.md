Seesaw Simulation

This is a simple seesaw (balance board) simulation built with pure JavaScript, HTML and CSS.
It focuses on torque, weight balance, animations, sound effects, and saving game state.

⸻

🎮 Live Demo

You can play the simulation directly here:

👉 https://yunusemrekoyun.github.io/yunus-emre-koyun-seesaw-simulation

Or you can download the project and open the index.html file in any browser.

⸻

🧠 Idea & Thinking Process

I started the project by planning two main sections:
	•	Control Panel: start, pause, mute buttons and log history
	•	Game Screen: the seesaw bar, ground, pivot, and falling objects

After creating the main layout, I worked on showing/hiding the game screen with the start button.
Then I added the basic objects of the scene: ground, pivot, and seesaw bar.

I created three arrays for weights, colors, and sizes, so every dropped object could be random but still controlled.

Later, I started working on torque calculation, angle movement, and balance logic.
After the simulation started feeling correct, I added sound effects, UI improvements, and localStorage saving.

In the end, the project became a mix of physics, UI logic, animation timing, and simple audio effects.

⸻

⚙️ Difficult Parts

1) Torque Calculations

At first, I tried to normalize the seesaw length for a more realistic result.
But the balance was not stable, so I decided to use a simpler calculation.
This gave a better and more controlled simulation.

2) Angle Response Based on Torque

The seesaw angle needed to move smoothly and respond to torque difference.
Connecting the angle animation with the falling animation was tricky.
I solved it by calling updateAngle() only after the falling animation finished.

3) Rebuilding State After Refresh

When the page reloads, all weights, torques, and angle must be calculated again.
loadState() had many variables to update, so it was complex.
After some work, I created a stable loading system.

4) Musical Notes for Left/Right Drops

I wanted each drop to play a different musical note (like “do-re-mi-fa”).
I used Web Audio API and semitone calculation to create the small melody.
This was challenging but very fun to build.

⸻

🧩 Function Descriptions

🎵 Audio Functions
	•	getAudioCtx()
Creates and returns the audio context for playing sound.
	•	playSfx(file)
Plays a short sound effect from a file.
	•	playHit(side)
Plays musical notes when a weight drops on left/right side.

⸻

🎮 Game Control
	•	startGame()
Shows the game screen and starts the simulation.
	•	resetGame()
Clears all values, removes objects, and resets the game.
	•	pause()
Pauses or resumes the game.
	•	nextWeight()
Selects the next random weight.

⸻

💾 Log System
	•	load()
Loads previous logs from localStorage and updates the screen.
	•	save()
Saves all logs to localStorage.
	•	getLogs()
Shows the logs inside the log panel.
	•	addLog(weight, signedDist)
Adds a new log entry and updates localStorage.
	•	clearLogs()
Clears all logs and removes them from storage.

⸻

📦 Game State (For Refresh Restore)
	•	saveState()
Saves the game state (weights, torque, angle, etc.) to localStorage.
	•	loadState()
Loads the saved state and updates all game values.
	•	recreateWeights()
Rebuilds all weight objects on the seesaw after refresh.

⸻

🧮 Physics & Position
	•	updatePhysics({ weight, localX })
Updates torque and weight values on each side.
	•	updateAngle()
Animates the seesaw angle based on torque difference.
	•	animateFall(element, size, onLanding)
Drops the weight with a falling animation.
	•	clickPositionOnStand(event)
Converts click coordinates to seesaw local position.

⸻

🎨 Visual Object Creation
	•	createWeight(data)
Creates a new weight element using size, color, and position.
	•	handleClickOnStand(event)
Handles clicking on the stand and dropping a weight.
	•	showTorquePreview(event)
Shows a preview of the torque before dropping.
	•	hideTorquePreview()
Hides the torque preview.

⸻

🤖 AI Usage
	•	I used AI to understand Web Audio API and musical note calculations.
	•	AI helped me compare torque calculation methods for deciding distance normalization(pixel or meter).
	•	I used a VS Code AI plugin for syntax and code support.
	•	AI helped me organize and format the README text.

⸻

📌 Final Notes

This project helped me practice JavaScript, physics simulation, timing, UI, and sound.
It was challenging and very fun to build for me. I hope you like the project and enjoy it! 

