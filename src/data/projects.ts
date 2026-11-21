import { Project } from '../types/Project';
import {
  GadgetLuxe,
  BAndQ,
  Todo,
} from '../images';

/** Recorded loops (scripts/record-demo.mjs) live in public/videos, served under the site base. */
const demo = (slug: string) => ({
  poster: `${import.meta.env.BASE_URL}videos/${slug}.jpg`,
  video: {
    webm: `${import.meta.env.BASE_URL}videos/${slug}.webm`,
    mp4: `${import.meta.env.BASE_URL}videos/${slug}.mp4`,
  },
});

export const PROJECT_LIST: Project[] = [
  {
    id: 1,
    name: "Gadget Luxe",
    type: 'web',
    year: 2023,
    category: "E-commerce",
    poster: GadgetLuxe,
    description: "project_desc_gadget",
    stack: ["React", "Typescript", "SCSS", "Node.js"],
    codelink: "https://github.com/fe-jul23-CodeDynasty/product_catalog",
    demolink: "https://fe-jul23-codedynasty.github.io/product_catalog/",
  },
  {
    id: 2,
    name: "Vue Weather App",
    type: 'web',
    year: 2024,
    featured: true,
    order: 2,
    category: "Vue",
    ...demo('weather'),
    description: "project_desc_weather",
    stack: ["Vue 3", "TypeScript", "Pinia", "Vue Query", "MapLibre", "Tailwind"],
    codelink: "https://github.com/edgergard/vue-weather-app?tab=readme-ov-file",
    demolink: "https://edgergard.github.io/vue-weather-app/",
  },
  {
    id: 3,
    name: "Rick and Morty API app",
    type: 'web',
    year: 2024,
    featured: true,
    order: 3,
    category: "GraphQL",
    ...demo('rick-and-morty'),
    description: "project_desc_rick",
    stack: ["React", "TypeScript", "GraphQL", "React Query", "Zustand", "Tailwind"],
    codelink: "https://github.com/edgergard/Rick-and-morty-fe",
    demolink: "https://edgergard.github.io/Rick-and-morty-fe/",
  },
  {
    id: 4,
    name: "Pokemon Trainer",
    type: 'web',
    year: 2024,
    featured: true,
    order: 1,
    category: "API",
    ...demo('pokemon'),
    description: "project_desc_pokeapi",
    stack: ["React", "TypeScript", "React Query", "React Hook Form", "Zod", "Three.js", "GSAP"],
    codelink: "https://github.com/edgergard/pokeAPI",
    demolink: "https://edgergard.github.io/pokeAPI/",
  },
  {
    id: 5,
    name: "Landing page for B&Q",
    type: 'web',
    year: 2023,
    category: "Landing",
    poster: BAndQ,
    description: "project_desc_bandq",
    stack: ["HTML5", "SCSS", "BEM"],
    codelink: "https://github.com/edgergard/B-Q-Landing",
    demolink: "https://edgergard.github.io/B-Q-Landing/",
  },
  {
    id: 6,
    name: "React Todo app",
    type: 'web',
    year: 2023,
    category: "Todo",
    poster: Todo,
    description: "project_desc_todo",
    stack: ["React", "Typescript", "SCSS"],
    codelink: "https://github.com/edgergard/react-todo-app",
    demolink: "https://edgergard.github.io/react_todo-app-with-api/",
  },
];

export const featuredProjects = (): Project[] =>
  PROJECT_LIST.filter((p) => p.featured)
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
    .slice(0, 3);
