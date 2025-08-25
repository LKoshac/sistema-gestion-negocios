module.exports = {
    jwtSecret: process.env.JWT_SECRET || 'mi_clave_secreta_super_segura_2024',
    dbPath: './database.sqlite',
    port: process.env.PORT || 3001,
    // TODO: Configuración para futuras integraciones de pago
    // stripe: {
    //     secretKey: process.env.STRIPE_SECRET_KEY,
    //     publishableKey: process.env.STRIPE_PUBLISHABLE_KEY
    // },
    // paypal: {
    //     clientId: process.env.PAYPAL_CLIENT_ID,
    //     clientSecret: process.env.PAYPAL_CLIENT_SECRET
    // }
};
