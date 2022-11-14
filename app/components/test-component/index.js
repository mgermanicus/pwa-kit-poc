import React from 'react'
import PropTypes from 'prop-types'

import {useCommerceAPI} from '../../commerce-api/contexts'
import {useSearchParams} from '../../hooks'

const TestComponent = ({message}) => {
    // const [params] = useSearchParams()

    const api = useCommerceAPI()

    // params.q = "women"
    // const p = Promise.resolve(getProductSearchResult(api, params))
    // const p = Promise.resolve(getAllCategories(api, {ids: "root"}))
    // const p = Promise.resolve(getProductsByCategory(api, "womens"))
    const p = Promise.resolve(getProductById(api, "013742002836M"))

    async function data() {
        try {
            const value = await p
            console.log(value)
        } catch (err) {
            console.log(err)
        }
    }

    data()

    return <h1>{message}</h1>
}

// From a keyword find all data from API
async function getProductSearchResult(api, params) {
    const productSearchResult = await api.shopperSearch.productSearch({
        parameters: params
    })

    return productSearchResult
}

async function getAllCategories(api, params) {
    const categories = await api.shopperProducts.getCategories({
        parameters: params
    })

    return categories
}

async function getProductsByCategory(api, category) {
    const products = await api.shopperSearch.productSearch({
        parameters: {refine: "cgid=" + category}
    })

    return products
}

async function getProductById(api, product_id) {
    const product = await api.shopperProducts.getProduct({
        parameters: { id: product_id }
    })

    return product
}

TestComponent.propTypes = {
    message: PropTypes.string,
    productSearchResult: PropTypes.object
}

export default TestComponent
