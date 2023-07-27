const  btnUpload =$("header div button");
const overlayElm=$("#overlay");
const dropElm =$("#drop-area");
const mainElm =$("main");
const REST_API_URL="http://localhost:8080/gallery";
const cssLoaderHtml = `<div class="lds-facebook"><div></div><div></div><div></div></div>`;

loadAllImages();


btnUpload.on("click",()=>{
    overlayElm.removeClass("d-none");
});
overlayElm.on('click',(eventData)=>{
    if(eventData.target===overlayElm[0]){
        overlayElm.addClass('d-none');
    }
});
$(document).on('keydown',(eventData)=>{
    if(eventData.key==='escape' && !overlayElm.hasClass('d-none')){
        overlayElm.addClass('d-none');
    }
});

overlayElm.on('dragover',(eventData)=>{
    eventData.preventDefault();
});
overlayElm.on('drop',(eventData)=>{
    eventData.preventDefault();
});
dropElm.on('drop',(eventData)=>{
    eventData.preventDefault();
    console.log(eventData)
    const dropFiles = eventData.originalEvent.dataTransfer.files;
    const imageFiles= Array.from(dropFiles).filter(file=>file.type.startsWith("image/"));
    if(!imageFiles.length) return;
    overlayElm.addClass('d-none');
    uploadImages(imageFiles);
});
mainElm.on('click','.image #download',(eventData)=>{
    let imageUrl = $(eventData.target).parents('.image').css('background-image');
    var split = imageUrl.split("/");
    imageName=split[split.length-1].substring(0,split[split.length-1].length-2)
    console.log(imageName);
    downlaod(imageName);
})

function uploadImages(images){
    const formData=new FormData();
    images.forEach(imageFile=>{
        const divElm =$('<div class="image loader"></div>');
        mainElm.append(divElm);
        formData.append("images",imageFile);

    });
    const jqxhr =$.ajax(`${REST_API_URL}/api/v1/images`,{
        method:'POST',
        crossDomain:true,
        data:formData,
        contentType:false, //by default jquery use application/x-www-form-urlencoded;
        processData:false //by default jquery try to convert data intoString;
    });
    jqxhr.done((imageList)=>{
        imageList.forEach(imageUrl=>{
            const divElm =$(".image.loader").first();
            divElm.append(`<svg id="download" xmlns="http://www.w3.org/2000/svg" width="25" height="25" fill="white" class="bi bi-cloud-arrow-down-fill" viewBox="0 0 16 16">
            <path d="M8 2a5.53 5.53 0 0 0-3.594 1.342c-.766.66-1.321 1.52-1.464 2.383C1.266 6.095 0 7.555 0 9.318 0 11.366 1.708 13 3.781 13h8.906C14.502 13 16 11.57 16 9.773c0-1.636-1.242-2.969-2.834-3.194C12.923 3.999 10.69 2 8 2zm2.354 6.854-2 2a.5.5 0 0 1-.708 0l-2-2a.5.5 0 1 1 .708-.708L7.5 9.293V5.5a.5.5 0 0 1 1 0v3.793l1.146-1.147a.5.5 0 0 1 .708.708z"/>
            </svg>`);
            divElm.removeClass('loader');
            divElm.css('background-image',`url('${imageUrl}')`);

        });
    });

}
function loadAllImages(){
    const jqxhr =$.ajax(`${REST_API_URL}/api/v1/images`,'GET');
    jqxhr.done((imgeList)=>{
        imgeList.forEach(imageUrl=>{
            const divElm =$('<div class="image"></div>');
            divElm.append(`<svg id="download" xmlns="http://www.w3.org/2000/svg" width="25" height="25" fill="white" class="bi bi-cloud-arrow-down-fill" viewBox="0 0 16 16">
            <path d="M8 2a5.53 5.53 0 0 0-3.594 1.342c-.766.66-1.321 1.52-1.464 2.383C1.266 6.095 0 7.555 0 9.318 0 11.366 1.708 13 3.781 13h8.906C14.502 13 16 11.57 16 9.773c0-1.636-1.242-2.969-2.834-3.194C12.923 3.999 10.69 2 8 2zm2.354 6.854-2 2a.5.5 0 0 1-.708 0l-2-2a.5.5 0 1 1 .708-.708L7.5 9.293V5.5a.5.5 0 0 1 1 0v3.793l1.146-1.147a.5.5 0 0 1 .708.708z"/>
            </svg>`);
            divElm.css('background-image',`url(${imageUrl})`);
            mainElm.append(divElm);
        });
    });
}
function downlaod(name) {
    const ajax=$.ajax(`${REST_API_URL}/api/v1/images/download?q=${name}`,'GET');
    ajax.done((data)=>{
        const byteCharacters = atob(data);
        const byteArray = new Uint8Array(byteCharacters.length);

        for (let i = 0; i < byteCharacters.length; i++) {
            byteArray[i] = byteCharacters.charCodeAt(i);
        }
        const byteArrayData = byteArray;
        const fileName = name;
        byteArrayToFile(byteArrayData, fileName);

    });
}
function byteArrayToFile(byteArray, fileName) {
    // Step 1: Create a Blob from the byteArray
    const blob = new Blob([byteArray]);

    // Step 2: Generate a temporary object URL
    const objectURL = URL.createObjectURL(blob);

    // Step 3: Create an anchor element
    const downloadLink = document.createElement("a");
    downloadLink.href = objectURL;
    downloadLink.download = fileName;

    // Step 4: Programmatically click on the anchor to initiate download
    document.body.appendChild(downloadLink);
    downloadLink.click();

    // Cleanup: Remove the temporary object URL after the download
    URL.revokeObjectURL(objectURL);
}

