'use client'

import { ScrapeAndStoreProduct } from '@/lib/actions'
import React, { FormEvent, useState } from 'react'

const isValidAmazonProductURL = (url: string) => {
    try {
        const parserURL = new URL(url)
        const hostname = parserURL.hostname

        if (
            hostname.includes('amazon.com') ||
            hostname.includes('amazon.') ||
            hostname.endsWith('amazon')
        ) {
            return true
        }
    } catch (error) {
        return false
    }
    return false
}

const SearchBar = () => {

    const [searchPrompt, setSearchPrompt] = useState('')
    const [isLoading, setIsLoading] = useState(false)

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault()

        const isValidLink = isValidAmazonProductURL(searchPrompt)

        if (!isValidLink) return alert('Please provide a valid amazon link')

        try {
            setIsLoading(true)

            const product = await ScrapeAndStoreProduct(searchPrompt)
        } catch (error) {
            console.log(error)
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <form
            className='flex flex-wrap gap-4 mt-12'
            onSubmit={handleSubmit}
        >
            <input
                type="text"
                placeholder='Enter Product Link'
                value={searchPrompt}
                onChange={(e) => setSearchPrompt(e.target.value)}
                className='searchbar-input'
            />

            <button
                type='submit'
                className='searchbar-btn'
                disabled={searchPrompt === ''}
            >

                {isLoading ? 'Searching...' : 'Serach'}
            </button>
        </form>
    )

}

export default SearchBar
