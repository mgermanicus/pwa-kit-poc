/*
 * Copyright (c) 2022, Salesforce, Inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import React, {useState} from 'react'
import PropTypes from 'prop-types'
import {HeartIcon, HeartSolidIcon} from '../icons'
import ImageGallery from '../../components/image-gallery'
import SwatchGroup from '../../components/swatch-group'
import Swatch from '../../components/swatch-group/swatch'
import {useVariationAttributes} from '../../hooks'

// Components
import {
    AspectRatio,
    Box,
    Skeleton as ChakraSkeleton,
    Text,
    Stack,
    useMultiStyleConfig,
    IconButton
} from '@chakra-ui/react'
import DynamicImage from '../dynamic-image'

// Hooks
import {useIntl} from 'react-intl'

// Other
import {productUrlBuilder} from '../../utils/url'
import Link from '../link'
import withRegistration from '../../hoc/with-registration'
import {useCurrency} from '../../hooks'

const IconButtonWithRegistration = withRegistration(IconButton)

// Component Skeleton
export const Skeleton = () => {
    const styles = useMultiStyleConfig('ProductTile')
    return (
        <Box data-testid="sf-product-tile-skeleton">
            <Stack spacing={2}>
                <Box {...styles.imageWrapper}>
                    <AspectRatio ratio={1} {...styles.image}>
                        <ChakraSkeleton />
                    </AspectRatio>
                </Box>
                <ChakraSkeleton width="80px" height="20px" />
                <ChakraSkeleton width={{base: '120px', md: '220px'}} height="12px" />
            </Stack>
        </Box>
    )
}

const ImagesSlider = (props) => {
    if (props.imageGroups) {
        return (
            <ImageGallery
                size="md"
                imageGroups={imageGroups}
            />
        )
    } else {
        return (
            <AspectRatio {...props.styles.image}>
                <DynamicImage
                    src={`${props.image.disBaseLink || props.image.link}[?sw={width}&q=60]`}
                    widths={props.dynamicImageProps?.widths}
                    imageProps={{
                        alt: props.image.alt,
                        ...props.dynamicImageProps?.imageProps
                    }}
                />
            </AspectRatio>
        )
    }
}

const RadioColors = (props) => {
    return (
        <>
            {/* Attribute Swatches */}
            {props.variationAttributes?.map((variationAttribute) => {
                const {id, name, selectedValue, values = []} = variationAttribute

                if (name === 'Color' && id)
                    return (
                        <SwatchGroup
                            key={id}
                            onChange={(_, href) => {
                                if (!href) return
                                history.replace(href)
                            }}
                            variant={id === 'color' ? 'circle' : 'square'}
                            value={selectedValue?.value}
                            displayName={selectedValue?.name || ''}
                            label={name}
                        >
                            {values.map(({name, value, image}) => (
                                <Swatch
                                    key={value}
                                    href={''}
                                    disabled={false}
                                    value={value}
                                    name={name}
                                >
                                    {id === 'color' ? (
                                        <Box
                                            height="100%"
                                            width="100%"
                                            minWidth="32px"
                                            backgroundRepeat="no-repeat"
                                            backgroundSize="cover"
                                            backgroundColor={name.toLowerCase()}
                                            backgroundImage={
                                                image
                                                    ? `url(${image.disBaseLink || image.link})`
                                                    : ''
                                            }
                                        />
                                    ) : (
                                        name
                                    )}
                                </Swatch>
                            ))}
                        </SwatchGroup>
                    )
            })}
        </>
    )
}

/**
 * The ProductTile is a simple visual representation of a
 * product object. It will show it's default image, name and price.
 * It also supports favourite products, controlled by a heart icon.
 */
const ProductTile = (props) => {
    const intl = useIntl()
    const {
        product,
        enableFavourite = false,
        isFavourite,
        onFavouriteToggle,
        dynamicImageProps,
        ...rest
    } = props
    const {currency, image, price, productId, imageGroups} = product

    let variationAttributes
    if (product.variants) {
        variationAttributes = useVariationAttributes(product)
    }

    // ProductTile is used by two components, RecommendedProducts and ProductList.
    // RecommendedProducts provides a localized product name as `name` and non-localized product
    // name as `productName`. ProductList provides a localized name as `productName` and does not
    // use the `name` property.
    const localizedProductName = product.name ?? product.productName

    const {currency: activeCurrency} = useCurrency()
    const [isFavouriteLoading, setFavouriteLoading] = useState(false)
    const styles = useMultiStyleConfig('ProductTile')

    let test
    if (imageGroups) {
        test = (
            <ImageGallery
                size="md"
                imageGroups={imageGroups}
                selectedVariationAttributes={variationAttributes[0]}
            />
        )
    } else {
        test = (
            <AspectRatio {...styles.image}>
                <DynamicImage
                    src={`${image.disBaseLink || image.link}[?sw={width}&q=60]`}
                    widths={dynamicImageProps?.widths}
                    imageProps={{
                        alt: image.alt,
                        ...dynamicImageProps?.imageProps
                    }}
                />
            </AspectRatio>
        )
    }

    return (
        <div {...styles.container}>
            <Link
                data-testid="product-tile"
                to={productUrlBuilder({id: productId}, intl.local)}
                {...rest}
            >
                <Box {...styles.imageWrapper}>
                    <>{test}</>
                    {/* <>{variations}</> */}
                    {enableFavourite && (
                        <Box
                            onClick={(e) => {
                                // stop click event from bubbling
                                // to avoid user from clicking the underlying
                                // product while the favourite icon is disabled
                                e.preventDefault()
                            }}
                        >
                            <IconButtonWithRegistration
                                aria-label={intl.formatMessage({
                                    id: 'product_tile.assistive_msg.wishlist',
                                    defaultMessage: 'Wishlist'
                                })}
                                icon={isFavourite ? <HeartSolidIcon /> : <HeartIcon />}
                                {...styles.favIcon}
                                disabled={isFavouriteLoading}
                                onClick={async () => {
                                    setFavouriteLoading(true)
                                    await onFavouriteToggle(!isFavourite)
                                    setFavouriteLoading(false)
                                }}
                            />
                        </Box>
                    )}
                </Box>

                {/* Title */}
                <Text {...styles.title}>{localizedProductName}</Text>

                {/* Price */}
                <Text {...styles.price}>
                    {intl.formatNumber(price, {
                        style: 'currency',
                        currency: currency || activeCurrency
                    })}
                </Text>
            </Link>

            <RadioColors variationAttributes={variationAttributes}></RadioColors>
        </div>
    )
}

ProductTile.displayName = 'ProductTile'

ProductTile.propTypes = {
    /**
     * The product search hit that will be represented in this
     * component.
     */
    product: PropTypes.shape({
        currency: PropTypes.string,
        image: PropTypes.shape({
            alt: PropTypes.string,
            disBaseLink: PropTypes.string,
            link: PropTypes.string
        }),
        price: PropTypes.number,
        // `name` is present and localized when `product` is provided by a RecommendedProducts component
        // (from Shopper Products `getProducts` endpoint), but is not present when `product` is
        // provided by a ProductList component.
        // See: https://developer.salesforce.com/docs/commerce/commerce-api/references/shopper-products?meta=getProducts
        name: PropTypes.string,
        // `productName` is localized when provided by a ProductList component (from Shopper Search
        // `productSearch` endpoint), but is NOT localized when provided by a RecommendedProducts
        // component (from Einstein Recommendations `getRecommendations` endpoint).
        // See: https://developer.salesforce.com/docs/commerce/commerce-api/references/shopper-search?meta=productSearch
        // See: https://developer.salesforce.com/docs/commerce/einstein-api/references/einstein-api-quick-start-guide?meta=getRecommendations
        // Note: useEinstein() transforms snake_case property names from the API response to camelCase
        productName: PropTypes.string,
        productId: PropTypes.string
    }),
    /**
     * Enable adding/removing product as a favourite.
     * Use case: wishlist.
     */
    enableFavourite: PropTypes.bool,
    /**
     * Display the product as a faviourite.
     */
    isFavourite: PropTypes.bool,
    /**
     * Callback function to be invoked when the user
     * interacts with favourite icon/button.
     */
    onFavouriteToggle: PropTypes.func,
    dynamicImageProps: PropTypes.object
}

export default ProductTile
