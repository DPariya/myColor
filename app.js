const colorDivs = document.querySelectorAll(".color");
const generateBtn = document.querySelector(".generate");
const sliders = document.querySelectorAll("input[type='range']")
const currentHexes = document.querySelectorAll(".color h2");
const popUp = document.querySelector(".copy-container");
const adjustBtn = document.querySelectorAll(".adjust");
const lockBtn = document.querySelectorAll(".lock");
const closeAdjustments = document.querySelectorAll(".close-adjustment");
const sliderPanel = document.querySelectorAll(".sliders");
const lockIconAll = document.querySelectorAll(".lock i");

let initialColor;
//This is for local storage
let savedPalettes = [];

//EVENT LISTENER
generateBtn.addEventListener("click", randomColors);
sliders.forEach(sliders => {
    sliders.addEventListener("input", hslControls);
});
colorDivs.forEach((div, index) => {
    div.addEventListener("change", () => {
        updateTextUi(index);
    });
});
currentHexes.forEach(hex => {
    hex.addEventListener("click", () => {
        copyToClipboard(hex);
    });
});
popUp.addEventListener("transitionend", () => {
    const popupBox = popUp.children[0];
    popUp.classList.remove("active");
    popupBox.classList.remove("active");
});
adjustBtn.forEach((button, index) => {
    button.addEventListener("click", () => {
        openAdjustmentPanel(index);
    });
});
closeAdjustments.forEach((button, index) => {
    button.addEventListener("click", () => {
        closeAdjustmentPanel(index);
    });
});
lockBtn.forEach((button, index) =>{
    button.addEventListener("click", () => {
        toggleLockBtn(index);
    });
});


//FUNCTIONS
//GENERATE HEX
function generateHex() {
    const currentHex = chroma.random();


    // const randomColor = Math.floor(Math.random()*16777215).toString(16);
     //currentHex = "#" + randomColor.toUpperCase();
    return  currentHex;

  }
//   let randomHex = generateHex();
//   console.log(randomHex);

//COLORS TO H2 TAG
function randomColors() {
    initialColor = [];
    colorDivs.forEach((div, index) => {
        const hexText = div.children[0];
        // const icons = div.children[1];
        const randomColor = generateHex();
        //Add to initial arr
        if(div.classList.contains("locked")){
            initialColor.push(hexText.innerText);
            return;
        }else{
            initialColor.push(chroma(randomColor).hex());
        }
        //Add colors to div and background
        div.style.backgroundColor = randomColor;
        hexText.innerHTML = randomColor;
        //CHECK FOR CONTRAST
        checkTextContrast(randomColor, hexText);
        // Initial Colorize slider
        const color = chroma(randomColor);
        const sliders = div.querySelectorAll(".sliders input");
        // console.log(sliders);
        const hue = sliders[0];
        const brightness = sliders[1];
        const saturation = sliders[2];

        colorizeSliders(color, hue, brightness, saturation);

    });
    //Reset Inputs
    resetInputs();
    //CHECK FOR ICON'S CONTRAST
    adjustBtn.forEach((button, index) => {
        checkTextContrast(initialColor[index], button);
        checkTextContrast(initialColor[index], lockBtn[index]);
        // console.log(button);
        // console.log(lockBtn[index]);
     });

}

//CHECK COLOR CONTRAST
function checkTextContrast(color,text) {
    const luminance = chroma(color).luminance();
    if(luminance > 0.5){
        text.style.color = "black";
    }else{
        text.style.color = "white";
    }
}
//COLORIZE SLIDERS
function colorizeSliders(color, hue, brightness, saturation) {
    //Scale Saturation
    const noSat = color.set('hsl.s', 0);
    const fullSat = color.set('hsl.s', 1)
    const scaleSat = chroma.scale([noSat, color, fullSat]);
    //Scale Brightness
    const midBright = color.set('hsl.l', 0.5);
    const scaleBright = chroma.scale(["black", midBright, "white"]);
    //Scale Hue

    //Upadte saturation Slider
    saturation.style.backgroundImage = `linear-gradient(to right, ${scaleSat(0)}, ${scaleSat(1)})`;

    //Update brightness Slider
    brightness.style.backgroundImage = `linear-gradient(to right, ${scaleBright(0.5)}, ${scaleBright(1)})`;

    //Update Hue Slider
    hue.style.backgroundImage = `linear-gradient(to right, rgb(204,75,75), rgb(204,240,75), rgb(75,204,75), rgb(75,204,204), rgb(75,75,204), rgb(204,75,204), rgb(204,75,75))`;


}

//HslControls Function
function hslControls(e){
    // console.log(e);
    const index = e.target.getAttribute("data-hue") || e.target.getAttribute("data-bright") || e.target.getAttribute("data-saturation");
    const sliders = e.target.parentElement.querySelectorAll("input[type='range']");
    // console.log(sliders);
    const hue = sliders[0];
    const bright = sliders[1];
    const saturation = sliders[2];
    
    const bgColor = initialColor[index];
    // console.log(saturation.value);
    const color = chroma(bgColor).set('hsl.h',hue.value).set('hsl.l',bright.value).set('hsl.s', saturation.value);
    colorDivs[index].style.backgroundColor = color;
    //Colorize Input/Slider
    colorizeSliders(color, hue, bright, saturation);
}

function updateTextUi(index) {
    const activeDiv = colorDivs[index];
    const color = chroma(activeDiv.style.backgroundColor);

    const hexText = activeDiv.querySelector("h2");
    const icons = activeDiv.querySelectorAll(".controls button");
    hexText.innerText = color.hex(); 
    checkTextContrast(color,hexText);
    for(icon of icons){
     checkTextContrast(color,icon);
    }
}
function resetInputs() {
    const sliders = document.querySelectorAll(".sliders input");
    sliders.forEach(slider => {
        if(slider.name === "hue"){
            const hueColor = initialColor[slider.getAttribute("data-hue")];
            // console.log(hueColor);
            const hueValue = chroma(hueColor).hsl()[0];
            // console.log(hueValue);
            slider.value = Math.floor(hueValue);
        }
        if(slider.name === "brightness"){
            // console.log(slider.name);

            const brightColor = initialColor[slider.getAttribute("data-bright")];
            // console.log(brightColor);
            const brightValue = chroma(brightColor).hsl()[2];
            // console.log(brightValue);
            slider.value = Math.floor(brightValue * 100)/100;
            // console.log(Math.floor(brightValue * 100)/100);

        }
        if(slider.name === "saturation"){
            const satuColor = initialColor[slider.getAttribute("data-saturation")];
            // console.log(satuColor);
            const satValue = chroma(satuColor).hsl()[1];
            slider.value = Math.floor(satValue * 100) / 100;


        }
      
    });
}

//Copy To Clip Board 
function copyToClipboard(hex) {
    const el = document.createElement("textarea");
    el.value = hex.innerText;
    document.body.appendChild(el);
    el.select();
    document.execCommand("copy");
    document.body.removeChild(el);
    //POPUP ANIMATION
    const popupBox = popUp.children[0];
    // console.log(popUp);
    popUp.classList.add("active");
    popupBox.classList.add("active");
}
function openAdjustmentPanel(index){
    sliderPanel[index].classList.toggle("active");
}
function closeAdjustmentPanel(index){
    sliderPanel[index].classList.remove("active");
}
function toggleLockBtn(index) {
    colorDivs[index].classList.toggle("locked");
    // console.log(lockIconAll[index]);

    if(colorDivs[index].classList.contains("locked")){
        lockIconAll[index].classList.remove("fa-lock-open");
        lockIconAll[index].classList.toggle("fa-lock");
    }else{
        lockIconAll[index].classList.add("fa-lock-open");
        lockIconAll[index].classList.toggle("fa-lock");

    }

}

//IMPLEMENT to SAVE and LOCAL STORAGE
const saveBtn = document.querySelector(".save");
const libraryBtn = document.querySelector(".library");
const submitSave = document.querySelector(".submit-save");
const closeSave = document.querySelector(".close-save");
const closeLibraryBtn = document.querySelector(".close-library");
const saveContainer = document.querySelector(".save-container");
const libraryContainer = document.querySelector(".library-container");
const saveInput = document.querySelector(".save-container input");

//Add Event Listner
saveBtn.addEventListener("click", openPalette);
closeSave.addEventListener("click", closePalette);
submitSave.addEventListener("click", savePalette);
libraryBtn.addEventListener("click", openLibrary);
closeLibraryBtn.addEventListener("click", closeLibrary);
function openPalette(e) {
    const popup = saveContainer.children[0];
    // console.log(popup);
    saveContainer.classList.add("active");
}
function closePalette(e){
    const popup = saveContainer.children[0];
    // console.log(popup);
    saveContainer.classList.remove("active");
}
function savePalette(e){
    saveContainer.classList.remove("active");
    const name = saveInput.value;
    const colors = [];

    //Taking all current hex of H2 tags and Pushing it in an array called colors
    currentHexes.forEach(hex => {
        colors.push(hex.innerText);
    });

    //Generate an Object

    // BUG
    //let paletteNr = savedPalettes.length;// this is for new generated palettes, but didnt wokrk for local storage data
    //Solve
    let paletteNr;
    const paletteObjects = JSON.parse(localStorage.getItem("palettes"));
    if(paletteObjects){
        paletteNr = paletteObjects.length;
    }else{
        paletteNr = savedPalettes.length;
    }
    const paletteObj = {name, colors , nr:paletteNr};
    savedPalettes.push(paletteObj);
    // console.log(savedPalettes);

    //SAVE to Local Storage
    saveToLocal(paletteObj);
    saveInput.value = '';

    //Generate the palette for library
    const palette = document.createElement("div");
    palette.classList.add("custom-palette");
    const title = document.createElement("h4");
    title.innerText = paletteObj.name;
    const preview = document.createElement("div");

    //creating small preview for palette
    preview.classList.add("small-preview");
    paletteObj.colors.forEach(smallColor => {
        const smallDiv = document.createElement("div");
        smallDiv.style.backgroundColor = smallColor;
        preview.appendChild(smallDiv);
    });

    const paletteBtn = document.createElement("button");
    paletteBtn.classList.add("pick-palette-btn");
    paletteBtn.classList.add(paletteObj.nr);
    paletteBtn.innerText = "Select";
    
    //Append Event to Button "SELECT"
    paletteBtn.addEventListener("click", e => {
        closeLibrary();
        const paletteIndex = e.target.classList[1];
        initialColor = [];
        savedPalettes[paletteIndex].colors.forEach((color, index) => {
            initialColor.push(color);
            colorDivs[index].style.backgroundColor = color;
             const text = colorDivs[index].children[0];
             text.innerText = color;
             checkTextContrast(color, text);
             updateTextUi(index);
        });
        resetInputs();

    });
    //Append Palette to Library
    palette.appendChild(title);
    palette.appendChild(preview);
    palette.appendChild(paletteBtn);
    libraryContainer.children[0].appendChild(palette);

}
function openLibrary() {
    const popup = libraryContainer.children[0];
    // console.log(popup);
    libraryContainer.classList.add("active");
}
function closeLibrary(e){
    const popup = libraryContainer.children[0];
    // console.log(popup);
    libraryContainer.classList.remove("active");
}

function saveToLocal(paletteObj) {
    let localPalettes;
    if(localStorage.getItem("palettes") === null){
        localPalettes = [];
    }else{
        localPalettes = JSON.parse(localStorage.getItem("palettes"));
    }
    localPalettes.push(paletteObj);
    localStorage.setItem("palettes", JSON.stringify(localPalettes));
}
// For getting data from local storage to page as we refresh

function getLocal(){
    if(localStorage.getItem("palettes") === null){
        localStorage = [];
    }else {
        const paletteObjects = JSON.parse(localStorage.getItem("palettes"));
        //BUG
        savedPalettes = [...paletteObjects];
        paletteObjects.forEach(paletteObj => { 
            //copying all From Generating preview
            //Generate the palette for library
            const palette = document.createElement("div");
            palette.classList.add("custom-palette");
            const title = document.createElement("h4");
            title.innerText = paletteObj.name;
            const preview = document.createElement("div");
            //creating small preview for palette
            preview.classList.add("small-preview");
            paletteObj.colors.forEach(smallColor => {
                const smallDiv = document.createElement("div");
                smallDiv.style.backgroundColor = smallColor;
                preview.appendChild(smallDiv);
            });

            const paletteBtn = document.createElement("button");
            paletteBtn.classList.add("pick-palette-btn");
            paletteBtn.classList.add(paletteObj.nr);
            paletteBtn.innerText = "Select";
            
            //Append Event to Button "SELECT"
            paletteBtn.addEventListener("click", e => {
                closeLibrary();
                const paletteIndex = e.target.classList[1];
                initialColor = [];
                paletteObjects[paletteIndex].colors.forEach((color, index) => {
                    initialColor.push(color);
                    colorDivs[index].style.backgroundColor = color;
                    const text = colorDivs[index].children[0];
                    text.innerText = color;
                    checkTextContrast(color, text);
                    updateTextUi(index);
                });
                resetInputs();

            });
            //Append Palette to Library
            palette.appendChild(title);
            palette.appendChild(preview);
            palette.appendChild(paletteBtn);
            libraryContainer.children[0].appendChild(palette);



        });
    }




}
// localStorage.clear();
console.log(savedPalettes);
getLocal();
randomColors();