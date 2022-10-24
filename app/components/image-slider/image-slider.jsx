import {
    AspectRatio,
    Box,
    Skeleton as ChakraSkeleton,
    Text,
    Stack,
    useMultiStyleConfig,
    IconButton
} from '@chakra-ui/react'


const imageSlider = ({ product }) => {
    const variationAttributes = useVariationAttributes(product);
    const {currency, image, price, productId, imageGroups, allImages} = product
    const styles = useMultiStyleConfig('ProductTile')

        

    
}