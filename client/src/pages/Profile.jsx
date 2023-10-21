import { useEffect, useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { app } from '../firebase'
import {
  getDownloadURL,
  getStorage,
  ref,
  uploadBytesResumable,
} from 'firebase/storage'
import {
  deleteUserFailure,
  deleteUserStart,
  deleteUserSuccess,
  signInStart,
  signOutUserFailure,
  signOutUserSuccess,
  updateUserFailure,
  updateUserStart,
  updateUserSuccess,
} from '../redux/user/userSlice'
import { Link } from 'react-router-dom'

const Profile = () => {
  const { currentUser, loading, error } = useSelector((state) => state.user)
  const [file, setFile] = useState(undefined)
  const [filePercent, setFilePercent] = useState(0)
  const [fileUploadError, setFileUploadError] = useState(false)
  const [formData, setFormData] = useState({})
  const [updateSuccess, setUpdateSuccess] = useState(false)
  const [showListingError, setShowListingError] = useState(false)
  const [userListings, setUserListings] = useState([])
  const fileRef = useRef(null)
  const dispatch = useDispatch()

  useEffect(() => {
    if (file) {
      handleFileUpload(file)
    }
  }, [file])

  const handleFileUpload = (file) => {
    const storage = getStorage(app)
    const fileName = new Date().getTime() + file.name
    const storageRef = ref(storage, fileName)
    const uploadTask = uploadBytesResumable(storageRef, file)
    //console.log(formData)

    uploadTask.on(
      'state_changed',
      (snapshot) => {
        const progress = Math.round(
          (snapshot.bytesTransferred / snapshot.totalBytes) * 100
        )
        setFilePercent(progress)
      },
      (error) => {
        setFileUploadError(true)
      },
      () => {
        getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
          setFileUploadError(false)
          setFormData({ ...formData, avatar: downloadURL })
        })
      }
    )
  }

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value })
    //console.log(formData)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      dispatch(updateUserStart())
      const res = await fetch(`/api/user/update/${currentUser._id}`, {
        method: 'Post',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })
      const data = await res.json()
      if (res.ok) {
        dispatch(updateUserSuccess(data))
        setUpdateSuccess(true)
      } else {
        dispatch(updateUserFailure(data.message))
      }
    } catch (error) {
      dispatch(updateUserFailure(error.message))
    }
  }

  const handleDelete = async () => {
    try {
      dispatch(deleteUserStart())
      const res = await fetch(`/api/user/delete/${currentUser._id}`, {
        method: 'Delete',
        headers: {
          'Content-Type': 'application/json',
        },
      })
      const data = await res.json()
      if (res.ok) {
        dispatch(deleteUserSuccess(data))
      } else {
        dispatch(deleteUserFailure(data.message))
      }
    } catch (error) {
      dispatch(deleteUserFailure(error.message))
    }
  }

  const handleSignOut = async () => {
    try {
      dispatch(signInStart())
      const res = await fetch('/api/auth/signout')
      const data = await res.json()
      if (res.ok) {
        dispatch(signOutUserSuccess(data))
      } else {
        dispatch(signOutUserFailure(data.message))
      }
    } catch (error) {
      dispatch(signOutUserFailure(error.message))
    }
  }

  const handleShowListing = async () => {
    try {
      setShowListingError(false)
      const res = await fetch(`/api/user/listings/${currentUser._id}`)
      const data = await res.json()
      //console.log(data)
      if (data.success === false) {
        setShowListingError(true)
        return
      }
      setUserListings(data)
    } catch (error) {
      showListingError(true)
    }
  }

  const handleListingDelete = async (id) => {
    try {
      const res = await fetch(`/api/listing/delete/${id}`, {
        method: 'Delete',
        headers: {
          'Content-Type': 'application/json',
        },
      })
      const data = await res.json()
      if (data.success === false) {
        console.log(data.message)
        return
      }
      setUserListings(userListings.filter((listing) => listing._id !== id))
    } catch (error) {
      console.log(error.message)
    }
  }

  return (
    <div className="p-3 max-w-lg mx-auto">
      <h1 className="text-3xl font-semibold text-center my-7">Profile</h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <input
          onChange={(e) => setFile(e.target.files[0])}
          type="file"
          ref={fileRef}
          hidden
          accept="image/*"
        />
        <img
          onClick={() => fileRef.current.click()}
          src={formData.avatar || currentUser.avatar}
          alt="profile"
          className="rounded-full h-24 w-24 object-cover cursor-pointer self-center mt-2"
        />
        <p className="text-sm text-center">
          {fileUploadError ? (
            <span className="text-red-700">
              Error Image Upload(Img should be less than 2mb)
            </span>
          ) : filePercent > 0 && filePercent < 100 ? (
            <span className="text-slate-700">{`Uploading 
              ${filePercent}%`}</span>
          ) : filePercent === 100 ? (
            <span className="text-green-700">Image Successfully Uploaded</span>
          ) : (
            <span className="text-slate-700">Upload Image</span>
          )}
        </p>
        <input
          onChange={handleChange}
          type="text"
          placeholder="username"
          id="username"
          defaultValue={currentUser.username}
          className="border p-3 rounded-lg"
        />
        <input
          onChange={handleChange}
          type="email"
          placeholder="email"
          id="email"
          defaultValue={currentUser.email}
          className="border p-3 rounded-lg"
        />
        <input
          onChange={handleChange}
          type="password"
          placeholder="password"
          id="password"
          className="border p-3 rounded-lg"
        />
        <button
          disabled={loading}
          className="bg-slate-700 text-white rounded-lg p-3 uppercase hover:opacity-95 disabled:opacity-80"
        >
          {loading ? 'Loading...' : 'Update Profile'}
        </button>
        <Link
          to={'/create-listing'}
          className="bg-green-700 text-white p-3 rounded-lg uppercase text-center hover:opacity-95 disabled:opacity-80"
        >
          Create Listing
        </Link>
      </form>
      <div className="flex justify-between mt-5">
        <span onClick={handleDelete} className="text-red-700 cursor-pointer ">
          Delete Account
        </span>
        <span onClick={handleSignOut} className="text-red-700 cursor-pointer ">
          Sign Out
        </span>
      </div>
      <p className="text-red-700 mt-5">{error || ' '}</p>
      <p className="text-green-700 mt-5">
        {updateSuccess && 'Profile  is Updated Successfully'}
      </p>
      <button onClick={handleShowListing} className="text-green-700 w-full">
        Show Listing
      </button>
      <p className="text-red-700 mt-t">
        {showListingError && 'Error showing on listings'}
      </p>
      {userListings && userListings.length > 0 && (
        <div className="flex flex-col gap-4">
          <h1 className="text-center mt-7 text-2xl font-semibold ">
            Your Listings
          </h1>
          {userListings.map((listing) => (
            <div
              key={listing._id}
              className="border rounded-lg p-3 flex justify-between items-center gap-4 "
            >
              <Link to={`/listing/${listing._id}`}>
                <img
                  src={listing.imageUrls[0]}
                  alt="listing cover"
                  className="w-16 h-16 object-contain "
                />
              </Link>
              <Link
                className="text-slate-700 font-semibold flex-1 hover:underline truncate"
                to={`/listing/${listing._id}`}
              >
                <p>{listing.name}</p>
              </Link>
              <div className="flex flex-col items-center">
                <button
                  onClick={() => handleListingDelete(listing._id)}
                  className="text-red-700"
                >
                  Delete
                </button>
                <Link to={`/update-listing/${listing._id}`}>
                  <button className="text-green-700">Edit</button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default Profile
