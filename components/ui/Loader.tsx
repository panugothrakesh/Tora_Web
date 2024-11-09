import React from 'react'

function Loader() {
  return (
    <div className='flex items-center justify-center min-h-screen'>
        <div className='w-32 h-32 border-b-2 border-blue-500 rounded-full animate-spin'></div>
    </div>
  )
}

export default Loader