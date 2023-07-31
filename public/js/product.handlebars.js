let fetchingUrl = 'http://localhost:8080/api/products'
let products = []
let prevLinkPage = ' '
let nextLinkPage = ' '

const fetchingData = async (Url) => {
    try {
            let response = await fetch(Url)
            let productsData = await response.json()
            return productsData
    }catch(err) {
        console.log('No es posible realizar un fetch de los productos ',err)
    }
}

const productCardRender = async (payload) => {
    products = payload
    let productBox = document.getElementById('productContainer')
    productBox.innerHTML = ' '
    products.map(product => {
        let productBlister = document.createElement('div')
        productBlister.classList.add('product-blister')
        let {_id, code, title, description, thumbnails, price, stock, status, category} = product
        productBlister.innerHTML = `
            <div class='product-info'>
                <h4>${title}</h4>
                <p>${description}</p>
                <p>Categoría: ${category}</p>
                <p>Cantidad disponible: ${stock} piezas</p>
                <p id="productPrice">$ ${price.toFixed(2)}</p>
            </div>
            <div class="image-box">
                <img src=${thumbnails[0]} />
            </div>
        `
        productBox.append(productBlister)
    })
}

const productsRender = async (Url) => {
    let productsData = await fetchingData(Url)
    let {payload, hasPrevPage, hasNextPage, prevLink, nextLink} = productsData
    productCardRender(payload)
    prevLinkPage = prevLink
    nextLinkPage = nextLink
    hasPrevPage ? document.getElementById("prevButton").style.display = "block" : document.getElementById("prevButton").style.display = "none"
    hasNextPage ? document.getElementById("nextButton").style.display = "block" : document.getElementById("nextButton").style.display = "none"
}

async function nextPage(nextLink) {
    await productsRender(nextLink)
}

async function prevPage(prevLink) {
    await productsRender(prevLink)
}

productsRender(fetchingUrl)

let prevButton = document.getElementById("prevButton")
prevButton.addEventListener('click', () => prevPage(prevLinkPage))
let nextButton = document.getElementById("nextButton")
nextButton.addEventListener('click', () => nextPage(nextLinkPage))
