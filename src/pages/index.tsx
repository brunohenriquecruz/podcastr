// SPA - single page aplication
// SSR - server side render
// SSG - server side generation
import { GetStaticProps } from 'next';
import Image from 'next/image';
import { api } from '../services/api';
import { format, parseISO} from 'date-fns'
import ptBR from 'date-fns/locale/pt-BR'
import { convertDurationToString } from '../utils/convertDurationToTimeString';

import styles from './home.module.scss';

type Episode = {
    id: string;
    title: string;
    thumbnail: string;
    description: string;
    members: string;
    duration: number;
    durationAsString: string;
    url: string;
    published_at: string
}

type HomeProps = {
  latestEpisodes: Episode[];
  allEpisodes: Episode[];
}

export default function Home({latestEpisodes, allEpisodes}: HomeProps) {
  return(
    <div className={styles.homepage}>
    <section className={styles.latestEpisodes}>
      <h2>Últimos Episódios</h2>

      <ul>
        {latestEpisodes.map(episode =>{
          return (
            <li key={episode.id}>
              <Image 
                width={192} 
                height={192} 
                src={episode.thumbnail} 
                alt={episode.title}
                objectFit="cover"
              />
              
              <div className={styles.episodeDetails}>
                <a href="">{episode.title}</a>
                <p>{episode.members}</p>
                <span>{episode.published_at}</span>
                <span>{episode.durationAsString}</span>
              </div>

              <button>
                <img src="play-green.svg" alt="Tocar episódio"/>
              </button>
            </li>
          )
        })}
      </ul>
    </section>
    <section className={styles.allEpisodes}>

    </section>
    </div>
  );
} 

// SSG
export const getStaticProps: GetStaticProps = async () => {
  const { data } = await api.get('episodes', {
    params: {
      _limit: 12,
      _sort: 'published_at',
      _order: 'desc'
    }
  })

  const episodes = data.map(episode=> {
    return {
      id: episode.id,
      title: episode.title,
      thumbnail: episode.thumbnail,
      members: episode.members,
      publishedAt: format(parseISO(episode.published_at), 'd MMM yy', {locale: ptBR}),
      durationAsString: convertDurationToString(Number(episode.file.duration)),
      duration: Number(episode.file.duration),
      url: episode.file.url,
    };
  })

  const latestEpisodes = episodes.slice(0,2);
  const allEpisodes = episodes.slice(2, episodes.length);

  return {
    props: {
      latestEpisodes,
      allEpisodes,
    },
    revalidate: 60 * 60 * 8  // um pod por dia = a cada 8hs, gera uma nova versão da página
  }
}



//____________________________________________________________________
  // // SPA - os dados são carregados somente quando
  // // a pessoa acessa a tela. Roda no JS do browser
  
  // useEffect(() => {
  //   fetch('http://localhost:3333/episodes')
  //   .then(response => response.json())
  //   .then(data =>console.log(data)) 
  // }, []) //dispara algo, sempre que algo mudar na aplicação
  
  // __________________________________________

// SSR
// export async function getServerSideProps () {
//     const response = await fetch('http://localhost:3333/episodes')
//     const data = await response.json()

//     return {
//       props: {
//         episodes: data,
//       }
//     }
//   }