// Middleware pour protéger la route
export const protectRoute = (req: { query: { username: any; password: any; }; }, res: { redirect: (arg0: string) => void; }, next: () => any) => {
    const { username, password } = req.query;
  
    // Vérifier si les informations correspondent à celles du fichier .env
    if (username === process.env.USERNAME && password === process.env.PASSWORD) {
      return next(); // Autoriser l'accès
    }
  
    // Rediriger vers la page de connexion si les informations ne sont pas valides
    res.redirect('/login');
};