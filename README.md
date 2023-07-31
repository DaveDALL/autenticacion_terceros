# REFACTORIZACIÓN DE LA AUTENTICACION DE USUARIO (MEDIANTE EXPRESS SESSION, BCRYPT Y PASSPORT)

A traves de este código, se pretende realizar la autentiación de un usuario, en primera instancia usando su correo electrónico y su contraseña; por lo que si no se encuentra registrado es posible que mediante un enlace, realizar un registro de usuario a través de un formulario donde se solicitará al usuario:

    - Nombre
    - Apellido
    - Correo electrónico
    - Contraseña

Una vez hecho el registro de usuario se redigirá al mismo hacia pagina de incio que es una ruta en **http://localhost:8080/**, donde se encuantra la página de login de usuarios.

Posteriormente, ya que el usuario se haya autentificado con su correo electrónico y contraseña,se redigirá hacia la página de products.

Por otro lado, también es posible realizar una autenticación a través de **github**, donde se realiza la configuración de la estrategia y router para realizar la solicitud de autenticación hacia github; donde una vez autentificado se almacena la información del usuario como correo electronico y nombre en la base de datos de MongoDB (no se almacena en ningun momento la contraseña). También es importante que el usuario que emplee este método de autenticación, tenga con visibilidad pública su nombre y correo electrónico.

Nota: Se crea un middlware que verifica si el usuario se encuentra en sesion para hacer el direccionamiento hacia la página de products, si se encuentra dentro de la sesión, podra ser direccionado a la ruta **http://localhost:8080/products**. En caso de que la sesion del usuario no esté activa, a pesar de que escriba en el navegador la ruta de productos NO podrá acceder a esta, y lo redigirá hacia la vista de login.

## EXPRESS SESSION

Para poder realizar el manejo de la sesión, se ocupa express-session, habilitando el middleware mediante app.use, usando el siguiente código en el index.js

```javascript

app.use(session({
    secret: 'secrecto de encriptación',
    resave: true,
    saveUninitialized: true
}))

```

La persistencia de la sesión se realiza con la dependencia connect-mongo, hacia la base de datos de MongoDB y la colección por default de **sessions**.

## CONNECT-MONGO

La persistencia de la sesión se realza medniante la conexión a la base de datos mongoDB, en la colección por defecto **sessions**, por lo que al objeto que se usa como parámentro de session, se agrega el key store, indicando que el almacenamiento de la sesión será en MongoDB.

```javascript

app.use(session({
     store: MongoStore.create({
        mongoUrl: 'URL de la base de datos en MongoDB ',
    }),
    secret: 'secrecto de encriptación',
    resave: true,
    saveUninitialized: true
}))

```

## HANDLEBARS

Mediante el uso de express-handlebars, se realizaran todas las vista:

- Login. Se usa formulario con método POST hacia el endpoint de **/authLogin**, que verifica si el usuario está registrado en la base de datos. Dentro de esta vista se agrega un botón para realizar la autenticación de terceros hacia github.
    
- Registro de usuario. De igual forma se usa un formulario con método POST hacia el endpoint de **/authRegistration**, donde se hace el registro de usuario hacia la base de datos
    
- Vista de productos. Una vez que el usuario se auntentifica, se dirige a la vista de productos, donde aparece su nombre de usuario y el rol de usuario. Para el caso de que el administrador se autentifique, apareca con el rol de admin. En caso de que no haya un usuario en sesión, si se quiere saltar la autentificación escribiendo en la barra del navegador el enlace hacia la vista de productos http://localhost:8080/products, no podra acceder y lo redigirá hacia la vista de login. Esta vista realiza un fetch hacia el endpoint http://localhost:8080/api/products, mediante el método GET. Una vez obtenidos los productos, se realiza el render de la tarjetas de productos, y se agrega un boton para el logout (salir)

y mediante CSS y JAVASCRIPT, se hace el manejo de los elementos html, datos, request y fetch hacia los endpoints

## EXPRESS ROUTER

A través de exprress router, se realiza el ruteo de las vistas y los endpoints.

1. Ruta de vistas. Se cuenta con la siguientes rutas de vistas:

- Cuatro rutas GET para renderizar las vista generadas por el motor de plantillas handlebars, hacia el registro de usuarios, login, logout y products.

2. Un router de auth para los endpoints para validar el registro de usuarios, login, y logout. En el endpoint de registro de usuario se realiza el registro de la información del usuario emplenado el siguiente modelo hacia la colección users:

```javascript

userName: {
        type: String,
        trim: true,
        required: true,
    },
    lastName: {
        type: String,
        trim: true,
    },
    userMail: {
        type: String,
        trim: true,
        required: true,
        unique: true,
    },
    userPassword: {
        type: String,
        trim: true,
    },
    userRoll : {
        type: String,
        required: true,
    }

```

Nota: Se elimina la opción de required en los objetos de lastName y userPassword, a fin de porder integrar con el almacenamiento de la información obtenida mediante la autenticación de terceros con github; sin embargo, al realizar la utenticación por login se reuqire que el usuario introduzca un correo electrónico y una contraseña de forma forsoza.

Un endpoint de login, que hace la interacción con la colección de users para buscar al usuario y con la colección sessions, para el almacenamiento de los datos del usuario mediante la persitencia en MongoDB. Una vez hecha la confirmación del usuario en la base de datos, se hace el direccionamiento hacia la vista de products. Si se loguea el administrador se observa el rol de admin; ademas el admin esta hardcodeado en router de auth, por lo que no esta en la base de datos.

3. Un router para el endpoint de products con el método GET, para descargar todos los productos de la base de datos en MongoDB. Mediante la vista de produtos se hace un fetch hacia este endpoint.

4. Un router para la autenticación con gihub, donde se implementa passport para realizar la autenticación mediante la estrategia de passport-github2.

## BCRYPT

Se realiza la integración de bcrypt, a fin de realizar un hasheo de la contraseña del usuario, en **/util/bcrypt**, donde se implementan las funciones para realizar la encriptación de la contraseña de usuario, y  para realizar la comparación de la contraseña introducida por el usuario, contra la contraseña registrada en MondoDB, la cual se encuentra encriptada.

## PASSPORT Y PASSPORT-GITHUB2

Se implementa passport y la estrategia de passport-github2, para poder realizar una autenticación de terceros mediante gihub. La estrategia se encuentra en el archivo en **/config/passportGit.config.js**. quedando de la siguiente forma:

```javascript

passport.use(new GitHubStrategy({
    clientID: GITHUB_CLIENT_ID,
    clientSecret: GITHUB_CLIENT_SECRET,
    callbackURL: "URL del callback"
  }, async (accessToken, refreshToken, profile, done) => {
        //código para identificar la existencia del usuario en MongoDB
        // Si no existe el usuario se crea uno nuevo
        done(null, user)
        //en la posción de user se enviar el usuario encontrado en MongoDB
        //o el usuario creado en MongoDB
  }))

```

Para activar la opción de poder integrar el usuario de github del Ecommerce, es importante realizarlo en la opción de settings del profile del Ecommerce, en la opción de developers, donde cre introducen los datos del URL de la pagina web del Ecommerce,se crea el Client ID y el Client Secret; y se coloca la URL del calback.

**Es importante que tanto en la creación de la aplicación en github, como en la estrategia y en la ruta del router de github, la ruta del callback sea igual en estos 3 lugares**.

A través de la estrategia se realiza la consulta hacia github por los datos de usuario. Para realziar la consulta se usa un router que apunta hacia el endpoint **/github**, donde se implementa passport para realizar la autenticación y usar la estrategia de github, empleando un scope de usuario con el correo electronico, y la sesion en false, ya que session se implementa de forma independiente, para poder hacer la persistencia de sesiones con MongoDB.

Una vez que el usuario realiza el login mediante github, se manda a llamar la ruta de callback, para almacenar en session la información del usuario obtenida por la estrategia de github, y poder hacer la revisión de autenticación mediante el middleware en el router de la vista de productos, una vez que se sabe que el usuario esta autentificado correctamente se redirige hacia la vista de productos.

A través de la estrategia de github, se recolecta la información del usuario de github, y se agrega a la base de datos en caso de que no se encuentre registardo, para esto en el campo de userPassword no se almacena ninguna información. Punto importante a tomar en cuenta, nuevamente, es que **tanto el nombre de usuario como el correo electrónico tengan visibilidad pública a fin de poder recopilar la información**. Mediante la función **done(null, user)** de la estrategia, se recibe en el callback la información del usuario mediante **req.user**.




## FIN