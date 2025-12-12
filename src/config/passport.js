import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import crypto from 'crypto';
import { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET } from '../../config.js';
import { User } from '../modules/usuario/user/user.model.js';
import { generateJWT } from '../utils/jwt.js';
import { createCustomerFlow } from '../services/flow.service.js';

passport.use(
  new GoogleStrategy(
    {
      clientID: GOOGLE_CLIENT_ID,
      clientSecret: GOOGLE_CLIENT_SECRET,
      callbackURL: '/api/v1/user/google/callback',
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        let user = await User.findOne({
          where: { correo: profile.emails[0].value.toLowerCase() },
        });

        console.log(user);

        if (!user) {
          user = await User.create({
            nombre: profile.name.givenName,
            apellidos: profile.name.familyName || '',
            correo: profile.emails[0].value.toLowerCase(),
            googleId: profile.id,
            status: 'active',
            verificationToken: crypto.randomBytes(32).toString('hex'),
            emailVerified: true,
          });

          const resFlow = await createCustomerFlow({
            name: `${user.nombre} ${user.apellidos}`,
            email: user.correo,
            external_id: user.id,
          });

          await user.update({ customerId: resFlow.customerId });
        }

        // ✅ Generar JWT
        const token = await generateJWT(user.id);

        return done(null, { user, token });
      } catch (err) {
        return done(err, null);
      }
    }
  )
);

export default passport;
