export function createImageContent(box, imageUrl) {
    const contentArea = box.querySelector('.content');
    contentArea.innerHTML = `<img src="${imageUrl}" style="width:100%; height:100%; object-fit: cover; pointer-events: none;" draggable="false">`

    // 1. Create a container (helpful for padding/centering)
    const imgContainer = document.createElement('div');
    imgContainer.className = "imageContainer";
    
    // 2. Create the actual image
    const img = document.createElement('img');
    img.src = imageUrl;
    
    imgContainer.appendChild(img);
    contentArea.appendChild(imgContainer);
}