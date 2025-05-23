// import React from 'react'
// import { Link } from 'react-router-dom'
// import CaptainDetails from '../components/CaptainDetails'

// const CaptainHome = () => {
//   return (
//     <div className='h-screen'>
//       <div className='fixed p-6 top-0 flex items-center justify-between w-screen '>
//         <img className="w-16" src="https://pngimg.com/d/uber_PNG24.png" alt="" />


//         <Link to='/captain-login' className=' h-8 w-10 bg-white flex itmes-center justify-center rounded-full'>
//           <i className=" text-lg font-medium ri-logout-box-line"></i>
//         </Link>


//       </div>


//       <div className='h-3/5'>
//         <img className='h-full w-full object-fit' src="https://miro.medium.com/v2/resize:fit:1400/0*gwMx05pqII5hbfmX.gif" alt="" />
//       </div>

//       <div className='h-2/5 p-6'>
//        <CaptainDetails />
//       </div>
//     </div>
//   )
// }

// export default CaptainHome


import React from 'react';
import { useState, useRef,useEffect,useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import CaptainDetails from '../components/CaptainDetails';
import RidePopUp from '../components/Ridepopup';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import ConfirmRidePopUp from '../components/ConfirmRideUp';
import { Link } from 'react-router-dom';
import { SocketContext } from '../context/SocketContext'
import { CaptainDataContext } from '../context/CaptainContext';
import axios from 'axios';

const CaptainHome = () => {
  const navigate = useNavigate(); 
  
  const[ ridePopupPanel , setRidePopupPanel ] = useState(false);
  const [confirmRidePopupPanel, setConfirmRidePopupPanel] = useState(false);


  const ridePopupPanelRef = useRef(null);
  const confirmRidePopupPanelRef = useRef(null)

  const { socket } = useContext(SocketContext);
  const { captain } = useContext(CaptainDataContext);
  const [ride, setRide] = useState(null);
  console.log("captainaagya"+captain)


  useEffect(() => {
    socket.emit('join', {
      userId: captain._id,
      userType: 'captain'
    });
  
    const updateLocation = () => {
      if (navigator.geolocation) {
        console.log("📍 Trying to get current location...");
        
        navigator.geolocation.getCurrentPosition(
          (position) => {
            console.log("✅ Location fetched:", {
              lat: position.coords.latitude,
              lng: position.coords.longitude,
              accuracy: position.coords.accuracy + " meters"
            });
    
            socket.emit('update-location-captain', {
              userId: captain._id,
              location: {
                lat: position.coords.latitude,
                lng: position.coords.longitude
              }
            });
          },
          (error) => {
            console.error("❌ Geolocation error:", error.message);
          },
          {
            enableHighAccuracy: true,
            timeout: 10000,       // Wait max 10 sec
            maximumAge: 0         // Always fetch new location, no cache
          }
        );
      } else {
        console.error("🚫 Geolocation not supported by this browser.");
      }
    };
    
    // Call once immediately
    updateLocation();
    
    // Repeat every 10 seconds
    const locationInterval = setInterval(updateLocation, 10000);
    
    // Cleanup on unmount
    return () => clearInterval(locationInterval)
  });
    
  
//   ✅ What it does:

// Checks if the browser supports geolocation.

// If yes:

// Gets the user's current latitude and longitude.

// Sends it to the server using socket.emit('update-location-captain', {...}).

// Logs the location in the browser console.

// If not:

// Logs an error saying geolocation isn’t supported

// As soon as the component mounts, it starts calling updateLocation() every 10 seconds.

// This means the captain's current location will be sent to the server repeatedly, keeping their position live/updated on the map or backend.

// On unmount (or component update), it clears the interval to avoid memory leaks
  



    socket.on('new-ride', (data) => {
      console.log("New ride data received:", data);
      setRide(data);
      setRidePopupPanel(true);
    })

    async function confirmRide() {

      const response=await axios.post(`${import.meta.env.VITE_BASE_URL}/rides/confirm-ride`,{
      rideId:ride._id,
      captainId:captain._id,
        
    },{
      headers:{
        Authorization: `Bearer ${localStorage.getItem('token')}`
      }
    })

    setRidePopupPanel(false);
    setConfirmRidePopupPanel(true);
    }






  useGSAP(function() {
    if (ridePopupPanel) {
      gsap.to(ridePopupPanelRef.current, {
        transform: "translateY(0)"
      });
    } else {
      gsap.to(ridePopupPanelRef.current, {
        transform: "translateY(100%)",
      });
    }
  },[ridePopupPanel]);

  useGSAP(
    function () {
      if (confirmRidePopupPanel) {
        gsap.to(confirmRidePopupPanelRef.current, {
          transform: "translateY(0)",
        });
      } else {
        gsap.to(confirmRidePopupPanelRef.current, {
          transform: "translateY(100%)",
        });
      }
    },
    [confirmRidePopupPanel]
  );



  const handleLogout = async () => {
    try {
      const response = await fetch('/logout', {
        method: 'GET',
        credentials: 'include', // Important for session-based authentication
      });

      if (response.ok) {
        // Clear any authentication tokens if stored
        localStorage.removeItem('token');

        console.log('Captain logout worked');

        // Redirect to login page
        navigate('/captain-login'); 
      } else {
        console.error('Logout failed');
      }
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };









  return (
    <div className="h-screen">
      <div className="fixed p-6 top-0 flex items-center justify-between w-screen">
        <img className="w-16" src="https://pngimg.com/d/uber_PNG24.png" alt="Logo" />

        <button
          onClick={handleLogout}
          className="h-8 w-10 bg-white flex items-center justify-center rounded-full"
        >
          <i className="text-lg font-medium ri-logout-box-line"></i>
        </button>
      </div>

      <div className="h-3/5">
        <img className="h-full w-full object-cover" src="https://miro.medium.com/v2/resize:fit:1400/0*gwMx05pqII5hbfmX.gif" alt="Gif" />
      </div>

      <div className="h-2/5 p-6">
        <CaptainDetails />
      </div>

      <div
        ref={ridePopupPanelRef}
        className="fixed w-full z-10 bottom-0 translate-y-full bg-white px-3 py-10 pt-12"
      >
        <RidePopUp
          ride={ride}
          setRidePopupPanel={setRidePopupPanel}
          setConfirmRidePopupPanel={setConfirmRidePopupPanel}
          confirmRide={confirmRide}
        />
      </div>

      {/*Confirm Ride Pop Up panel */}
      <div
        ref={confirmRidePopupPanelRef}
        className="fixed w-full h-screen z-10 bottom-0 translate-y-full bg-white px-3 py-10 pt-12"
      >
        <ConfirmRidePopUp
        ride={ride}
          setConfirmRidePopupPanel={setConfirmRidePopupPanel}
          setRidePopupPanel={setRidePopupPanel}
        />
      </div>

    </div>
  );
};

export default CaptainHome;
