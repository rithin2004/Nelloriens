import CategoryManager  from '../../components/common/CategoryManager'
import TabbedManage     from '../../components/common/TabbedManage'
import TheatresManager  from './TheatresManager'
import { moviesApi }    from '../../services/api'

export default function MoviesManage() {
  return (
    <TabbedManage
      title="Movies — Manage"
      backTo="/movies/list"
      tabs={[
        {
          label: 'Genres',
          content: (
            <CategoryManager
              title="Genres" entityLabel="Genre" hideHeader
              getAll={()           => moviesApi.getGenres()}
              create={(data)       => moviesApi.createGenre(data)}
              update={(id, data)   => moviesApi.updateGenre(id, data)}
              remove={(id)         => moviesApi.deleteGenre(id)}
            />
          ),
        },
        {
          label: 'Languages',
          content: (
            <CategoryManager
              title="Languages" entityLabel="Language" hideHeader
              getAll={()           => moviesApi.getLanguages()}
              create={(data)       => moviesApi.createLanguage(data)}
              update={(id, data)   => moviesApi.updateLanguage(id, data)}
              remove={(id)         => moviesApi.deleteLanguage(id)}
            />
          ),
        },
        {
          label: 'Theatres',
          content: <TheatresManager hideHeader />,
        },
      ]}
    />
  )
}
