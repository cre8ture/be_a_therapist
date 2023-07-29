import Image from 'next/image'
// import ViewSource from './view-source'
import styles from './styles.module.css'
// import mountains from './mountains.jpg'
// import mountains from './topography.svg'


const BackgroundPage = () => (
  <div className={styles.myElement}>
    {/* <ViewSource pathname="background.tsx" /> */}
    <div className={styles.bgWrap}>
      {/* <Image
        alt="Mountains"
        src={mountains}
        // placeholder="blur"
        quality={100}
        fill
        sizes="100vw"
        style={{
          objectFit: 'cover',
          zIndex: -100,
        }}
      /> */}
    </div>
    <p className={styles.bgText}>
      Image Component
      <br />
      as a Background
    </p> 
  </div>
)

export default BackgroundPage