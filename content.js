const MAX_Z_INDEX = 2147483647;

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    if (request.action === "togglePopover") {
        // Check if there's a stored image
        chrome.storage.local.get(["storedImage"], function (result) {
            if (result.storedImage) {
                // Display stored image
                displayImage(result.storedImage);
                updateThumbnail(result.storedImage);
            }
        });
        popover.style.display = "block";
    }
});

// Create and style the popover
const popover = document.createElement("div");
popover.id = "extensionPopover";
popover.style.position = "fixed";
popover.style.top = "20px";
popover.style.right = "20px";
popover.style.backgroundColor = "white";
popover.style.padding = "20px";
popover.style.borderRadius = "8px";
popover.style.boxShadow = "0 2px 10px rgba(0,0,0,0.1)";
popover.style.zIndex = `${MAX_Z_INDEX}`;
popover.style.display = "none";

// Create file input
const fileInput = document.createElement("input");
fileInput.type = "file";
fileInput.id = "imageInput";
fileInput.accept = ".jpg,.jpeg";
fileInput.style.display = "none";

// Create thumbnail container
const thumbnailContainer = document.createElement("div");
thumbnailContainer.style.width = "100px";
thumbnailContainer.style.height = "100px";
thumbnailContainer.style.border = "1px dashed #ccc";
thumbnailContainer.style.borderRadius = "4px";
thumbnailContainer.style.marginBottom = "10px";
thumbnailContainer.style.overflow = "hidden";
thumbnailContainer.style.position = "relative";
thumbnailContainer.style.cursor = "pointer";

// Create thumbnail image
const thumbnailImg = document.createElement("img");
thumbnailImg.style.width = "100%";
thumbnailImg.style.height = "100%";
thumbnailImg.style.objectFit = "cover";
thumbnailImg.style.display = "none";

// Create placeholder text
const placeholderText = document.createElement("div");
placeholderText.textContent = "Click to select image";
placeholderText.style.position = "absolute";
placeholderText.style.top = "50%";
placeholderText.style.left = "50%";
placeholderText.style.transform = "translate(-50%, -50%)";
placeholderText.style.color = "#999";
placeholderText.style.fontSize = "12px";
placeholderText.style.textAlign = "center";

// Add elements to thumbnail container
thumbnailContainer.appendChild(thumbnailImg);
thumbnailContainer.appendChild(placeholderText);

// Add click handler to thumbnail container
thumbnailContainer.onclick = () => fileInput.click();

// Add close button
const closeButton = document.createElement("button");
closeButton.textContent = "×";
closeButton.style.position = "absolute";
closeButton.style.top = "5px";
closeButton.style.right = "5px";
closeButton.style.border = "none";
closeButton.style.background = "none";
closeButton.style.fontSize = "20px";
closeButton.style.cursor = "pointer";
closeButton.onclick = () => {
    popover.style.display = "none";
};

// Add minimize/maximize button
const minimizeButton = document.createElement("button");
minimizeButton.textContent = "−";
minimizeButton.style.position = "absolute";
minimizeButton.style.top = "5px";
minimizeButton.style.right = "30px";
minimizeButton.style.border = "none";
minimizeButton.style.background = "none";
minimizeButton.style.fontSize = "20px";
minimizeButton.style.cursor = "pointer";
minimizeButton.style.padding = "0 5px";

// Add toggle pointer-events button
const togglePointerButton = document.createElement("button");
togglePointerButton.textContent = "Toggle Interaction";
togglePointerButton.style.marginTop = "10px";
togglePointerButton.style.padding = "5px 10px";
togglePointerButton.style.border = "1px solid #ccc";
togglePointerButton.style.borderRadius = "4px";
togglePointerButton.style.cursor = "pointer";
togglePointerButton.style.backgroundColor = "#f0f0f0";

// Add opacity slider
const opacitySlider = document.createElement("input");
opacitySlider.type = "range";
opacitySlider.min = "0";
opacitySlider.max = "100";
opacitySlider.value = "50";
opacitySlider.style.width = "100%";
opacitySlider.style.marginTop = "10px";

// Add opacity label
const opacityLabel = document.createElement("div");
opacityLabel.textContent = "Opacity: 50%";
opacityLabel.style.marginTop = "5px";
opacityLabel.style.fontSize = "12px";

// Store current opacity
let currentOpacity = 0.5;

// Update opacity slider functionality
opacitySlider.oninput = function () {
    currentOpacity = this.value / 100;
    opacityLabel.textContent = `Opacity: ${this.value}%`;
    const container = document.getElementById("extensionImageContainer");
    if (container) {
        container.style.opacity = currentOpacity;
    }
};

// Add elements to popover
popover.appendChild(closeButton);
popover.appendChild(minimizeButton);
popover.appendChild(thumbnailContainer);
popover.appendChild(togglePointerButton);
popover.appendChild(opacitySlider);
popover.appendChild(opacityLabel);
document.body.appendChild(popover);

// Minimize/maximize functionality
let isMinimized = false;
const contentElements = [
    thumbnailContainer,
    togglePointerButton,
    opacitySlider,
    opacityLabel,
];

minimizeButton.onclick = function () {
    isMinimized = !isMinimized;
    if (isMinimized) {
        minimizeButton.textContent = "+";
        contentElements.forEach((el) => (el.style.display = "none"));
        popover.style.padding = "5px";
        popover.style.width = "auto";
    } else {
        minimizeButton.textContent = "−";
        contentElements.forEach((el) => (el.style.display = "block"));
        popover.style.padding = "20px";
        popover.style.width = "";
    }
};

// Handle file selection
fileInput.addEventListener("change", function (e) {
    const file = e.target.files[0];
    if (file && file.type.match("image/jpeg")) {
        const reader = new FileReader();
        reader.onload = function (e) {
            const imageData = e.target.result;
            // Update thumbnail
            updateThumbnail(imageData);
            // Store the image data
            chrome.storage.local.set({ storedImage: imageData }, function () {
                displayImage(imageData);
            });
        };
        reader.readAsDataURL(file);
    }
});

function updateThumbnail(imageData) {
    thumbnailImg.src = imageData;
    thumbnailImg.style.display = "block";
    placeholderText.style.display = "none";
}

function displayImage(imageData) {
    // Remove existing image container if it exists
    const existingContainer = document.getElementById(
        "extensionImageContainer",
    );
    if (existingContainer) {
        existingContainer.remove();
    }

    // Create a container for the image
    const container = document.createElement("div");
    container.id = "extensionImageContainer";
    container.style.position = "absolute";
    container.style.top = "0";
    container.style.left = "0";
    container.style.opacity = currentOpacity;
    container.style.zIndex = (MAX_Z_INDEX - 1).toString();
    container.style.cursor = "move";

    // Create the image element
    const img = document.createElement("img");
    img.src = imageData;
    img.style.pointerEvents = "none";

    // Update toggle button functionality
    togglePointerButton.onclick = function () {
        container.style.pointerEvents =
            container.style.pointerEvents === "none" ? "auto" : "none";
    };

    // Add close button
    const closeButton = document.createElement("button");
    closeButton.textContent = "×";
    closeButton.style.position = "absolute";
    closeButton.style.top = "-10px";
    closeButton.style.right = "-10px";
    closeButton.style.width = "24px";
    closeButton.style.height = "24px";
    closeButton.style.border = "none";
    closeButton.style.borderRadius = "50%";
    closeButton.style.background = "#ff4444";
    closeButton.style.color = "white";
    closeButton.style.fontSize = "16px";
    closeButton.style.cursor = "pointer";
    closeButton.style.display = "flex";
    closeButton.style.alignItems = "center";
    closeButton.style.justifyContent = "center";
    closeButton.onclick = function () {
        container.remove();
        // Remove stored image when closed
        chrome.storage.local.remove("storedImage");
        // Update thumbnail
        thumbnailImg.style.display = "none";
        placeholderText.style.display = "block";
        // Reset file input
        fileInput.value = "";
    };

    // Add elements to container
    container.appendChild(img);
    container.appendChild(closeButton);
    document.body.appendChild(container);

    // Drag and drop functionality
    let isDragging = false;
    let currentX;
    let currentY;
    let initialX;
    let initialY;
    let xOffset = 0;
    let yOffset = 0;

    container.addEventListener("mousedown", dragStart);
    document.addEventListener("mousemove", drag);
    document.addEventListener("mouseup", dragEnd);

    function dragStart(e) {
        if (e.target === closeButton) return; // Don't drag if clicking close button

        initialX = e.clientX - xOffset;
        initialY = e.clientY - yOffset;

        if (e.target === container || e.target === img) {
            isDragging = true;
        }
    }

    function drag(e) {
        if (isDragging) {
            e.preventDefault();

            currentX = e.clientX - initialX;
            currentY = e.clientY - initialY;

            xOffset = currentX;
            yOffset = currentY;

            setTranslate(currentX, currentY, container);
        }
    }

    function dragEnd() {
        initialX = currentX;
        initialY = currentY;
        isDragging = false;
    }

    function setTranslate(xPos, yPos, el) {
        el.style.transform = `translate3d(${xPos}px, ${yPos}px, 0)`;
    }
}
