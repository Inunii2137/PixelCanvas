const canvas = document.getElementById("canvas");

const colors = document.querySelectorAll(".color");

const timerElement =
    document.getElementById("timer");

const SIZE = 50;

const COOLDOWN = 5000;

let selectedColor = "#000000";

/* -----------------------------
   SELECT COLOR
----------------------------- */

colors.forEach(color => {

    color.addEventListener("click", () => {

        selectedColor =
            color.dataset.color;
    });
});

/* -----------------------------
   CREATE PIXELS
----------------------------- */

for (let y = 0; y < SIZE; y++) {

    for (let x = 0; x < SIZE; x++) {

        const pixel =
            document.createElement("div");

        pixel.classList.add("pixel");

        pixel.dataset.x = x;
        pixel.dataset.y = y;

        pixel.addEventListener(
            "click",
            async () => {

                const lastPlaced =
                    Number(
                        localStorage.getItem(
                            "lastPlaced"
                        )
                    );

                if (lastPlaced) {

                    const timePassed =
                        Date.now() - lastPlaced;

                    if (timePassed < COOLDOWN) {

                        alert(
                            "You must wait before placing another pixel!"
                        );

                        return;
                    }
                }

                pixel.style.backgroundColor =
                    selectedColor;

                await fetch("/pixel", {

                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify({
                        x,
                        y,
                        color: selectedColor
                    })
                });

                localStorage.setItem(
                    "lastPlaced",
                    Date.now()
                );

                updateTimer();
            }
        );

        canvas.appendChild(pixel);
    }
}

/* -----------------------------
   LOAD PIXELS
----------------------------- */

async function loadPixels() {

    try {

        const response =
            await fetch("/pixels");

        const data =
            await response.json();

        data.pixels.forEach(p => {

            const selector =
                `.pixel[data-x='${p.x}'][data-y='${p.y}']`;

            const pixel =
                document.querySelector(selector);

            if (pixel) {

                pixel.style.backgroundColor =
                    p.color;
            }
        });

    } catch (error) {

        console.error(error);
    }
}

loadPixels();

setInterval(loadPixels, 5000);

/* -----------------------------
   TIMER
----------------------------- */

function updateTimer() {

    const lastPlaced =
        Number(
            localStorage.getItem(
                "lastPlaced"
            )
        );

    if (!lastPlaced) {

        timerElement.textContent =
            "You can place a pixel now!";

        return;
    }

    const timePassed =
        Date.now() - lastPlaced;

    const timeLeft =
        COOLDOWN - timePassed;

    if (timeLeft <= 0) {

        timerElement.textContent =
            "You can place a pixel now!";

        return;
    }

    const seconds =
        Math.ceil(timeLeft / 1000);

    timerElement.textContent =
        `Next pixel in ${seconds}s`;
}

setInterval(updateTimer, 1000);

updateTimer();

/* -----------------------------
   RESET BUTTON
----------------------------- */

const resetBtn =
    document.getElementById("resetBtn");

if (resetBtn) {

    resetBtn.addEventListener(
        "click",
        async () => {

            await fetch("/reset", {
                method: "DELETE"
            });

            localStorage.clear();

            location.reload();
        }
    );
}
// -----------------------------
// ZOOM + PAN
// -----------------------------

const canvasWrapper =
    document.querySelector(".canvas-wrapper");

let scale = 1;
let posX = 0;
let posY = 0;

let isDragging = false;
let startX = 0;
let startY = 0;

// Mouse wheel zoom

canvasWrapper.addEventListener("wheel", (e) => {

    e.preventDefault();

    const zoomSpeed = 0.1;

    if (e.deltaY < 0) {
        scale += zoomSpeed;
    } else {
        scale -= zoomSpeed;
    }

    scale = Math.max(1, Math.min(scale, 5));

    updateTransform();
});

// Drag

canvasWrapper.addEventListener("mousedown", (e) => {

    isDragging = true;

    startX = e.clientX - posX;
    startY = e.clientY - posY;
});

window.addEventListener("mouseup", () => {

    isDragging = false;
});

window.addEventListener("mousemove", (e) => {

    if (!isDragging) return;

    posX = e.clientX - startX;
    posY = e.clientY - startY;

    updateTransform();
});

function updateTransform() {

    canvasWrapper.style.transform =
        `translate(${posX}px, ${posY}px) scale(${scale})`;
}
