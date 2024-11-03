console.log("Loaded compressor script")

const uploader_picker = document.querySelector('[type=file]')
const zip_file = new JSZip()

const canvas = document.createElement('canvas')
const ctx = canvas.getContext('2d')


async function compress_file(file){
    if (file['type'].split('/')[0] === 'image'){
            const url = URL.createObjectURL(file)
            const img = new Image()
            img.src = url;
            await img.decode()

            console.log(img)

            canvas.width = img.naturalWidth
            canvas.height = img.naturalHeight
                    
            ctx.drawImage(img, 0, 0)

            await new Promise(resolve => canvas.toBlob((blob) => {
                console.log(blob)
                resolve(zip_file.file(`${file.name.split('.')[0]}.webp`, blob))
            }, 'image/webp', 0.8))
        }
}

uploader_picker.addEventListener('change', async () =>{
    Promise.all(Array.from(uploader_picker.files).map(compress_file))
        .then( () => {
            console.log(1)
            zip_file.generateAsync({
                type: 'blob',
                streamFiles: true
            }).then(data => {
                const link = document.createElement('a')
                link.href = URL.createObjectURL(data)
                link.download = 'compressed_imgs.zip'
                link.click()
            })
        })

    })



