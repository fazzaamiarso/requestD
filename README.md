# RequestD
Create song request submission easily. Inspired by ngl.link. Integrated with spotify.

# Tools
This app is bootstrapped with [create-t3-app](https://github.com/t3-oss/create-t3-app)
- **Framework**: [Next.js](https://nextjs.org/)
- **Database**: [PlanetScale](https://planetscale.com)
- **ORM**: [Prisma](https://prisma.io/)
- **Authentication**: [NextAuth.js](https://next-auth.js.org/)
- **Deployment**: [Vercel](https://vercel.com)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Defining & Consuming API**: [Trpc](https://trpc.io)

## Setup locally
```bash
$ git clone https://github.com/fazzaamiarso/requestD.git
$ cd requestD
$ npm install
```
Create a `.env` file with the content from `.env.example`
```bash
$ npm run dev
```
## Improvements
- [x] Add pending ui to some interactions.
- [x] Next-auth callback behave weirdly on some device, but still able to login.
- [ ] Implement better error-handling on Spotify lib with Zod.
- [ ] Refactor TRPC routes because it just a mess.
- [ ] Why initial SSR loading feel so slow?
- [ ] Cleanup UI for some pages

## Contributing
Feel free to file an issue or open a pull request.

## License
[MIT](https://choosealicense.com/licenses/mit/)

