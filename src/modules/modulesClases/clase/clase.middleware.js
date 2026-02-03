import { AppError } from '../../../utils/AppError.js';
import { catchAsync } from '../../../utils/catchAsync.js';
import { CategoriaRecurso } from '../../ajustes/categoriaRecurso/categoriaRecurso.model.js';
import { TipoRecurso } from '../../ajustes/tipoRecurso/tipoRecurso.model.js';
import { CategoriaRecursoId } from '../../recurso/categoriaRecursoId.model.js';
import { Recurso } from '../../recurso/recurso.model.js';
import { TipoRecursoId } from '../../recurso/tipoRecursoId.model.js';
import { Clase } from './clase.model.js';

export const validExistClase = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const clase = await Clase.findOne({
    where: {
      id,
    },
    include: [
      {
        model: Recurso,
        as: 'recurso',
        include: [
          {
            model: CategoriaRecursoId,
            as: 'categorias_ids',

            include: [{ model: CategoriaRecurso, as: 'categoria_recurso' }],
          },
          {
            model: TipoRecursoId,
            as: 'tipos_ids',

            include: [{ model: TipoRecurso, as: 'tipo_recurso' }],
          },
        ],
      },
    ],
  });

  if (!clase) {
    return next(new AppError(`clase with id: ${id} not found `, 404));
  }

  req.clase = clase;
  next();
});
