const express = require('express')
const { Router } = express
const router = new Router()
const Product = require('../dao/models/product.model')

//Endpoint que resuelve la solicitud y realiza filtrado, ordenamiento y paginación de los productos existentes
router.get('/', async (req, res) => {

    let {limit, pageNum, sort, filterBy, keyword} = req.query
    let query = {}
    let searchAggregate = []
    let requiredProducts = {}
    let sorting = ((sort === 'asc') ? 1 : ((sort === 'desc' ? -1 : undefined)))
    let existence = ((filterBy === 'status') ? (keyword === 'true' ? true : false) : undefined)
    
    try{
        if(sort) {
            if(filterBy) {
                query[filterBy] = ((filterBy === 'status') ? existence : keyword)
                searchAggregate = await Product.aggregate([
                    {
                        $match: query
                    },
                    {
                        $sort: {price: sorting}
                    }
                ])
            }else {
                searchAggregate = await Product.find().sort({price: sorting})
            }
        }else {
            if(filterBy) {
                query[filterBy] = ((filterBy === 'status') ? existence : keyword)
                console.log(query)
                searchAggregate = await Product.aggregate([
                    {
                        $match: query
                    }
                ])
            }else {
                searchAggregate = await Product.find()
            }
        }

        if(limit && pageNum) {
            const options = {
                limit: Number(limit),
                page: Number(pageNum)
            }
            requiredProducts = await Product.aggregatePaginate(searchAggregate, options).then(results => {
                return results
            }).catch(err => {
                console.log('No es posible realizar paginate ' + err)
                return {}
            })
        }else {
            requiredProducts = {
                docs: searchAggregate,
                page: 1,
                totalPages: 1,
                hasPrevPage: false,
                hasNextPage: false,
                prevPage: null,
                nextPage: null,
            }
        }
        
        let {totalPages, prevPage, nextPage, page, hasPrevPage, hasNextPage} = requiredProducts
        let prevPageLink = (prevPage ? (req.protocol + '://' + req.get('host') + req.originalUrl.replace(`pageNum=${pageNum}`, `pageNum=${Number(pageNum) - 1}`)) : null)
        let nextPageLink = (nextPage ? (req.protocol + '://' + req.get('host') + req.originalUrl.replace(`pageNum=${pageNum}`, `pageNum=${Number(pageNum) + 1}`)) : null)

        res.status(200).send({
            status: 'success',
            payload: requiredProducts.docs,
            totalPages,
            prevPage,
            nextPage,
            page,
            hasPrevPage,
            hasNextPage,
            prevLink: prevPageLink,
            nextLink: nextPageLink
        })

    }catch(err) {
        console.log('No es posible realizar el aggregate y paginación ' + err)
        res.status(500).send({status: 'error', error: 'No es posible obtener productos con mongoose'})
    }
})

module.exports = router