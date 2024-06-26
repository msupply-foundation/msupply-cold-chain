export class DevService {
  randomReal = (min: number, max: number): number => Math.random() * (max - min) + min;

  randomInt = (min: number, max: number): number => Math.floor(this.randomReal(min, max));

  randomHex = (): string => '0123456789ABCDEF'.charAt(this.randomInt(0, 16));

  randomMac = (): string => 'XX:XX:XX:XX:XX:XX'.replace(/X/g, () => this.randomHex());
}
