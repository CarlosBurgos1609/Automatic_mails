import React from 'react'
import './../styles/styles.scss'
import logojudicatura from './../assets/images/ConsejoSuperiorDeLaJudicatura.png'


const Home = () => {
    return (
        <body>
            <div className=' flex-column title'>
                <h1>Consejo Superior de la Judicatura</h1>
            </div>
            <div className='flex-row img-title'> <img src={logojudicatura} alt="Consejo superior de la Judicatura logo" />

            </div>
        </body>
    )
}

export default Home
