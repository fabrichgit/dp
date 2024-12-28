// Middleware pour protéger la route
export const protectRoute = (req: { query: { username: any; password: any; }; }, res: { redirect: (arg0: string) => void; }, next: () => any) => {
    const { username, password } = req.query;
    console.log(process.env.USERNAME, process.env.PASSWORD);
  
    if (username === process.env.USERNAME && password === process.env.PASSWORD) {
        
      res.redirect("/app")
      return;
    }
    res.redirect('/login');
};