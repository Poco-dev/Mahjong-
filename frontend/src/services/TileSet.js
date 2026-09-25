import empty from "@/assets/empty.png";

// Картинки плиток. import.meta.glob нужен, чтобы картинки попадали в production-сборку.
const images = import.meta.glob("../assets/cars/*.png", { eager: true, import: "default" });

const CARS = [
  ["lada", "Lada"], ["moskvich", "Москвич"], ["uaz", "УАЗ"], ["honda", "Honda"],
  ["infinity", "Infiniti"], ["mitsubishi", "Mitsubishi"], ["lexus", "Lexus"], ["mazda", "Mazda"],
  ["nissan", "Nissan"], ["tayota", "Toyota"], ["chevrolet", "Chevrolet"], ["ford", "Ford"],
  ["tesla", "Tesla"], ["audi", "Audi"], ["bmw", "BMW"], ["mercedes", "Mercedes"],
  ["porsche", "Porsche"], ["volkswagen", "Volkswagen"], ["opel", "Opel"], ["kia", "Kia"],
  ["hyundai", "Hyundai"], ["ferrari", "Ferrari"], ["lamborghini", "Lamborghini"], ["rollsroyce", "Rolls-Royce"],
  ["bugatti", "Bugatti"], ["jaguar", "Jaguar"], ["skoda", "Škoda"], ["peugeot", "Peugeot"],
  ["landrover", "Land Rover"], ["citroen", "Citroën"], ["renault", "Renault"], ["cadillac", "Cadillac"],
  ["fiat", "Fiat"], ["jeep", "Jeep"], ["subaru", "Subaru"], ["volvo", "Volvo"],
];

export const TILES = CARS.map(([file, name], type) => ({
  type,
  name,
  src: images[`../assets/cars/${file}.png`],
}));

export function tileSrc(type) {
  return TILES[type]?.src ?? empty;
}

export function tileName(type) {
  return TILES[type]?.name ?? "";
}
