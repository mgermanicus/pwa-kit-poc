/*
 * Copyright (c) 2021, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import React, {useEffect} from 'react'
import PropTypes from 'prop-types'

// Hooks
import useShopper from '../../commerce-api/hooks/useShopper'
import useCustomer from '../../commerce-api/hooks/useCustomer'
import useWishlist from '../../hooks/use-wishlist'

// Others
import {flatten} from '../../utils/utils'
import {getTargetLocale, fetchTranslations} from '../../utils/locale'

import {resolveSiteFromUrl} from '../../utils/site-utils'
import useMultiSite from '../../hooks/use-multi-site'

const DEFAULT_NAV_DEPTH = 3
const DEFAULT_ROOT_CATEGORY = 'root'

const App = (props) => {
    const customer = useCustomer()
    const {site, locale, buildUrl} = useMultiSite()

    const {l10n} = site
    // Get the current currency to be used through out the app
    const currency = locale.preferredCurrency || l10n.defaultCurrency

    // Set up customer and basket
    useShopper({currency})

    const wishlist = useWishlist()
    useEffect(() => {
        if (!customer.isInitialized) {
            return
        }
        if (customer.isRegistered) {
            wishlist.init()
        }
        if (customer.isGuest) {
            wishlist.reset()
        }
    }, [customer.authType])

    return <></>
}

App.shouldGetProps = () => {
    // In this case, we only want to fetch data for the app once, on the server.
    return typeof window === 'undefined'
}

App.getProps = async ({api, res}) => {
    const site = resolveSiteFromUrl(res.locals.originalUrl)
    const l10nConfig = site.l10n
    const targetLocale = getTargetLocale({
        getUserPreferredLocales: () => {
            // CONFIG: This function should return an array of preferred locales. They can be
            // derived from various sources. Below are some examples of those:
            //
            // - client side: window.navigator.languages
            // - the page URL they're on (example.com/en-GB/home)
            // - cookie (if their previous preference is saved there)
            //
            // If this function returns an empty array (e.g. there isn't locale in the page url),
            // then the app would use the default locale as the fallback.

            // NOTE: Your implementation may differ, this is just what we did.
            //
            // Since the CommerceAPI client already has the current `locale` set,
            // we can use it's value to load the correct messages for the application.
            // Take a look at the `app/components/_app-config` component on how the
            // preferred locale was derived.
            const {locale} = api.getConfig()

            return [locale]
        },
        l10nConfig
    })
    const messages = await fetchTranslations(targetLocale)

    // Login as `guest` to get session.
    await api.auth.login()

    // Get the root category, this will be used for things like the navigation.
    const rootCategory = await api.shopperProducts.getCategory({
        parameters: {
            id: DEFAULT_ROOT_CATEGORY,
            levels: DEFAULT_NAV_DEPTH
        }
    })

    if (rootCategory.isError) {
        const message =
            rootCategory.title === 'Unsupported Locale'
                ? `
It looks like the locale “${rootCategory.locale}” isn’t set up, yet. The locale settings in your package.json must match what is enabled in your Business Manager instance.
Learn more with our localization guide. https://sfdc.co/localization-guide
`
                : rootCategory.detail
        throw new Error(message)
    }

    // Flatten the root so we can easily access all the categories throughout
    // the application.
    const categories = flatten(rootCategory, 'categories')

    return {
        targetLocale,
        messages,
        categories,
        config: res?.locals?.config
    }
}

App.propTypes = {
    children: PropTypes.node,
    targetLocale: PropTypes.string,
    messages: PropTypes.object,
    categories: PropTypes.object,
    config: PropTypes.object
}

export default App
