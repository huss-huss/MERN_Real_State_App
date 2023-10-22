import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { Swiper, SwiperSlide } from 'swiper/react'
import SwiperCore from 'swiper'
import { Navigation } from 'swiper/modules'
import 'swiper/css/bundle'

const Listing = () => {
  SwiperCore.use([Navigation])
  const params = useParams()
  const [listing, setListing] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    const fetchListing = async () => {
      const listingId = params.listingId
      try {
        setLoading(true)
        setError(false)
        const res = await fetch(`/api/listing/get/${listingId}`)
        const data = await res.json()
        if (data.success === false) {
          console.log(data.message)
          setError(true)
          setLoading(false)
          return
        }
        setListing(data)
        setLoading(false)
        setError(false)
      } catch (error) {
        setError(true)
        setLoading(false)
      }
    }
    fetchListing()
  }, [])
  return (
    <main>
      {loading && <div className="text-center my-7 text-2xl">Loading...</div>}
      {error && (
        <div className="text-center my-7 text-2xl">Something Went Wrong!</div>
      )}
      {listing && !loading && !error && (
        <>
          <Swiper navigation>
            {listing.imageUrls.map((imageUrl, index) => (
              <SwiperSlide key={index}>
                <div
                  className="h-[550px]"
                  style={{
                    background: `url(${imageUrl}) center no-repeat`,
                    backgroundSize: 'cover',
                  }}
                ></div>
              </SwiperSlide>
            ))}
          </Swiper>
        </>
      )}
    </main>
  )
}

export default Listing
