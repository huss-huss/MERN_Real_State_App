import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import ListingItem from '../components/ListingItem'

const Search = () => {
  const navigate = useNavigate()
  const [sidebarData, setSidebarData] = useState({
    searchTerm: '',
    type: 'all',
    parking: false,
    furnished: false,
    offer: false,
    sort: 'created_at',
    order: 'desc',
  })

  //console.log(sidebarData)

  const [loading, setLoading] = useState(false)
  const [listings, setListings] = useState([])
  const [showMore, setShowMore] = useState(false)

  //console.log(listings)

  useEffect(() => {
    const urlParams = new URLSearchParams(location.search)
    const searchTermFromUrl = urlParams.get('searchTerm')
    const typeFromUrl = urlParams.get('type')
    const parkingFromUrl = urlParams.get('parking')
    const furnishedFromUrl = urlParams.get('furnished')
    const offerFromUrl = urlParams.get('offer')
    const sortFromUrl = urlParams.get('sort')
    const orderFromUrl = urlParams.get('order')

    if (
      searchTermFromUrl ||
      typeFromUrl ||
      parkingFromUrl ||
      furnishedFromUrl ||
      offerFromUrl ||
      sortFromUrl ||
      orderFromUrl
    ) {
      setSidebarData({
        searchTerm: searchTermFromUrl || '',
        type: typeFromUrl || 'all',
        parking: parkingFromUrl === 'true' ? true : false,
        furnished: furnishedFromUrl === 'true' ? true : false,
        offer: offerFromUrl === 'true' ? true : false,
        sort: sortFromUrl || 'created_at',
        order: orderFromUrl || 'desc',
      })
    }

    const fetchListings = async () => {
      try {
        setLoading(true)
        setShowMore(false)
        const searchQuery = urlParams.toString()
        const res = await fetch(`/api/listing/get?${searchQuery}`)
        const data = await res.json()
        if (data.length > 8) {
          setShowMore(true)
        } else {
          setShowMore(false)
        }
        setListings(data)
        setLoading(false)
      } catch (error) {
        setLoading(false)
        console.log(error.message)
      }
    }
    fetchListings()
  }, [location.search])

  //console.log(sidebarData)

  const handleChange = (e) => {
    const { id, value, checked } = e.target
    if (id === 'all' || id === 'rent' || id === 'sale') {
      setSidebarData({
        ...sidebarData,
        type: id,
      })
    }

    if (id === 'searchTerm') {
      setSidebarData({
        ...sidebarData,
        searchTerm: value,
      })
    }

    if (id === 'parking' || id === 'furnished' || id === 'offer') {
      setSidebarData({
        ...sidebarData,
        [id]: checked || checked === 'true' ? true : false,
      })
    }

    if (id === 'sort_order') {
      const sort = value.split('_')[0] || 'created_at'
      const order = value.split('_')[1] || 'desc'

      setSidebarData({
        ...sidebarData,
        sort,
        order,
      })
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const { searchTerm, type, parking, furnished, offer, sort, order } =
      sidebarData
    const urlParams = new URLSearchParams()
    urlParams.set('searchTerm', searchTerm)
    urlParams.set('type', type)
    urlParams.set('parking', parking)
    urlParams.set('furnished', furnished)
    urlParams.set('offer', offer)
    urlParams.set('sort', sort)
    urlParams.set('order', order)
    const searchQuery = urlParams.toString()
    navigate(`/search?${searchQuery}`)
  }

  const onShowMoreClick = async () => {
    const numberOfListings = listings.length
    const startIndex = numberOfListings
    const urlParams = new URLSearchParams(location.search)
    urlParams.set('startIndex', startIndex)
    const searchQuery = urlParams.toString()
    const res = await fetch(`/api/listing/get?${searchQuery}`)
    const data = await res.json()
    if (data.length < 9) {
      setShowMore(false)
    }
    setListings([...listings, ...data])
  }

  return (
    <div className="flex flex-col md:flex-row">
      <div className="p-7 border-b-2 md:border-r-2 md:min-h-screen">
        <form onSubmit={handleSubmit} className="flex flex-col gap-8">
          <div className="flex items-center gap-2">
            <label className="font-semibold whitespace-nowrap">
              Search Term:
            </label>
            <input
              type="text"
              id="searchTerm"
              placeholder="Search..."
              className="border rounded-lg p-3 w-full"
              value={sidebarData.searchTerm}
              onChange={handleChange}
            />
          </div>
          <div className="flex gap-2 flex-wrap items-center">
            <label className="font-semibold ">Type:</label>
            <div className="flex gap-2">
              <input
                className="w-5"
                type="checkbox"
                id="all"
                checked={sidebarData.type === 'all'}
                onChange={handleChange}
              />
              <span>Rent & Sale</span>
            </div>
            <div className="flex gap-2">
              <input
                className="w-5"
                type="checkbox"
                id="rent"
                checked={sidebarData.type === 'rent'}
                onChange={handleChange}
              />
              <span>Rent</span>
            </div>
            <div className="flex gap-2">
              <input
                className="w-5"
                type="checkbox"
                id="sale"
                checked={sidebarData.type === 'sale'}
                onChange={handleChange}
              />
              <span>Sale</span>
            </div>
            <div className="flex gap-2">
              <input
                className="w-5"
                type="checkbox"
                id="offer"
                checked={sidebarData.offer}
                onChange={handleChange}
              />
              <span>Offer</span>
            </div>
          </div>
          <div className="flex gap-2 flex-wrap items-center">
            <label className="font-semibold ">Amenities:</label>
            <div className="flex gap-2">
              <input
                className="w-5"
                type="checkbox"
                id="parking"
                checked={sidebarData.parking}
                onChange={handleChange}
              />
              <span>Parking</span>
            </div>
            <div className="flex gap-2">
              <input
                className="w-5"
                type="checkbox"
                id="furnished"
                checked={sidebarData.furnished}
                onChange={handleChange}
              />
              <span>Furnished</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <label className="font-semibold">Sort:</label>
            <select
              className="border rounded-lg p-3"
              id="sort_order"
              onChange={handleChange}
              defaultValue={'created_at_desc'}
            >
              <option value="regularPrice_desc">Price high to low</option>
              <option value="regularPrice_asc">Price low to high</option>
              <option value="createdAt_desc">Latest</option>
              <option value="createdAt_asc">Oldest</option>
            </select>
          </div>

          <button className="bg-slate-700 uppercase  text-white rounded-lg p-3 text-center hover:opacity-95 ">
            Search
          </button>
        </form>
      </div>
      <div className="flex-1">
        <h1 className="text-3xl font-semibold border-b mt-5 p-3 text-slate-700">
          Listing results:
        </h1>
        <div className="p-7 flex flex-wrap gap-4">
          {!loading && listings.length === 0 && (
            <div className=" text-xl text-slate-700">No listings found</div>
          )}
          {loading && (
            <div className=" text-xl text-slate-700 text-center w-full">
              Loading...
            </div>
          )}
          {!loading &&
            listings &&
            listings.map((listing) => (
              <ListingItem key={listing._id} listing={listing} />
            ))}

          {showMore && (
            <button
              onClick={onShowMoreClick}
              className="text-green-700 hover:underline p-7 text-center w-full"
            >
              Show More
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default Search
