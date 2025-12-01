import { Plan } from './plan.model.js';
import { catchAsync } from '../../utils/catchAsync.js';
import {
  createPlanPayPal,
  createProductPayPal,
} from '../../services/paypal.service.js';
import { createPlanFlow } from '../../services/flow.service.js';

export const findAll = catchAsync(async (req, res, next) => {
  const planes = await Plan.findAll({});
  // const planes = [
  //   {
  //     id: 1,
  //     nombre_plan: 'Plan Básico',
  //     precio_plan: 5,
  //     titulo: ' Paga por 1 mes',
  //     descripcion: '*30 días de contenido exclusivo',
  //     color_card: '#FFEE97',
  //     color_principal: '#FFE251',
  //     color_text: '#8A8A8A',
  //     ruta_img: '/planes/planB.png',
  //   },
  //   {
  //     id: 2,
  //     nombre_plan: 'Plan Estándar',
  //     precio_plan: 27,
  //     titulo: ' Paga por 6 meses y ahorra 10%',
  //     descripcion: '*precio regular $30USD',
  //     color_card: '#C3F3F3',
  //     color_principal: '#68E1E0',
  //     color_text: '#8A8A8A',
  //     ruta_img: '/planes/planE.png',
  //   },
  //   {
  //     id: 3,
  //     nombre_plan: 'Plan Pro Crafter',
  //     precio_plan: 55,
  //     titulo: 'Paga una vez al año',
  //     descripcion: '*precio regular $60USD',
  //     color_card: '#FFB4DF',
  //     color_principal: '#FC68B9',
  //     color_text: '#ffffff',
  //     ruta_img: '/planes/planPro.png',
  //   },
  // ];

  // await Promise.all(
  //   planes.map((p) =>
  //     Plan.create({
  //       nombre_plan: p.nombre_plan,
  //       precio_plan: p.precio_plan,
  //     })
  //   )
  // );

  return res.status(200).json({
    status: 'Success',
    results: planes.length,
    planes,
  });
});

export const findOne = catchAsync(async (req, res, next) => {
  const { plan } = req;

  return res.status(200).json({
    status: 'Success',
    plan,
  });
});

export const create = catchAsync(async (req, res, next) => {
  const { planId, nombre_plan, precio_plan, intervalo } = req.body;

  const planFlow = await createPlanFlow({
    planId,
    name: nombre_plan,
    amount: precio_plan,
    interval_count: intervalo,
  });

  const planPaypal = await createPlanPayPal({
    product_id: 'PROD-34W534599M8489241',
    name: nombre_plan,
    amount: precio_plan,
    interval_count: intervalo,
  });

  // 2. Guardar el plan en tu BD
  const newPlan = await Plan.create({
    nombre_plan,
    precio_plan,
    interval_count: intervalo,
    flow_plan_id: planFlow.planId,
    paypal_plan_id: planPaypal.id,
  });

  return res.status(201).json({
    status: 'success',
    newPlan,
  });
});

// async function createPlan() {
//   const planPaypal = await createProductPayPal({
//     product_id: 'PROD-4E113873AC239922K',
//     name: 'Plan Pro Crafter',
//     description: '222',
//     amount: 55,
//     interval_count: 12,
//   });
// }

// createPlan();

export const createProducto = catchAsync(async (req, res, next) => {
  // const { planId, nombre_plan, precio_plan, intervalo } = req.body;

  const product = await createProductPayPal({
    name: 'Membresía Premium',
    description: 'Acceso a funcionalidades avanzadas',
  });

  return res.status(201).json({
    status: 'success',
    product,
  });
});

export const update = catchAsync(async (req, res) => {
  const { plan } = req;
  const { nombre, costo } = req.body;

  await plan.update({
    nombre,
    costo,
  });
  return res.status(200).json({
    status: 'success',
    message: 'plan information has been updated',
    plan,
  });
});

export const deletePlan = catchAsync(async (req, res) => {
  const { plan } = req;

  await plan.destroy();

  return res.status(200).json({
    status: 'success',
    message: `The plan with id: ${plan.id} has been deleted`,
  });
});
