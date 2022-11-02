import React from 'react'
import {Box, IconButton, useBreakpointValue} from '@chakra-ui/react'
import {BiLeftArrowAlt, BiRightArrowAlt} from 'react-icons/bi'
import Slider from 'react-slick'

const settings = {
    dots: true,
    arrows: true,
    fade: true,
    infinite: true,
    autoplay: true,
    speed: 500,
    autoplaySpeed: 5000,
    slidesToShow: 1,
    slidesToScroll: 1
}

export default function Carousel(thumbnailImages) {

    const [slider, setSlider] = React.useState(null)

    const top = useBreakpointValue({base: '90%', md: '50%'})
    const side = useBreakpointValue({base: '30%', md: '10px'})

    return (
        <Box
            position={'relative'}
            height={'auto'}
            width={'full'}
            overflow={'hidden'}>
            {/* CSS files for react-slick */}
            <link
                rel='stylesheet'
                type='text/css'
                charSet='UTF-8'
                href='https://cdnjs.cloudflare.com/ajax/libs/slick-carousel/1.8.1/slick.min.css'
            />
            <link
                rel='stylesheet'
                type='text/css'
                href='https://cdnjs.cloudflare.com/ajax/libs/slick-carousel/1.8.1/slick-theme.min.css'
            />
            {/* Left Icon */}
            <IconButton
                aria-label='left-arrow'
                colorScheme='messenger'
                borderRadius='full'
                position='absolute'
                left={side}
                top={top}
                transform={'translate(0%, -50%)'}
                zIndex={2}
                onClick={() => slider?.slickPrev()}>
                <BiLeftArrowAlt />
            </IconButton>
            {/* Right Icon */}
            <IconButton
                aria-label='right-arrow'
                colorScheme='messenger'
                borderRadius='full'
                position='absolute'
                right={side}
                top={top}
                transform={'translate(0%, -50%)'}
                zIndex={2}
                onClick={() => slider?.slickNext()}
            >
                <BiRightArrowAlt />
            </IconButton>
            {/* Slider */}
            <Slider {...settings} ref={(slider) => setSlider(slider)}>
                {thumbnailImages.map((image, index) => {
                    return (
                        <img
                            alt={image.alt}
                            src={image.disBaseLink}
                            draggable='true'
                            key={index}
                        />
                    )
                })}
            </Slider>
        </Box>
    )
}