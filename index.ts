#!/usr/bin/env node

import { program } from 'commander';
import chalk from 'chalk';
import { getWeather, getForecast } from './api';
import { saveFavorite, getFavorites } from './storage';
import { formatWeather, formatForecast } from './formatter';

// Настройка CLI
program
  .version('1.0.0')
  .description('Приложение для получения информации о погоде')
  .option('-c, --city <city>', 'Название города для проверки погоды')
  .option('-f, --forecast', 'Получить прогноз на 5 дней')
  .option('-a, --add-favorite <city>', 'Добавить город в избранное')
  .option('--favorites', 'Показать погоду для избранных городов')
  .parse(process.argv);

const options = program.opts();

async function main() {
  try {
    if (options.addFavorite) {
      saveFavorite(options.addFavorite);
      console.log(chalk.green(`Город "${options.addFavorite}" добавлен в избранное`));
      return;
    }

    if (options.favorites) {
      const favorites = getFavorites();
      if (favorites.length === 0) {
        console.log(chalk.yellow('У вас нет избранных городов'));
        return;
      }

      console.log(chalk.blue('Погода в избранных городах:'));
      for (const city of favorites) {
        const weatherData = await getWeather(city);
        console.log(formatWeather(weatherData));
      }
      return;
    }

    if (!options.city) {
      console.log(chalk.red('Пожалуйста, укажите город с помощью флага --city'));
      program.help();
      return;
    }

    if (options.forecast) {
      const forecastData = await getForecast(options.city);
      console.log(formatForecast(forecastData));
    } else {
      const weatherData = await getWeather(options.city);
      console.log(formatWeather(weatherData));
    }
  } catch (error) {
    console.error(chalk.red('Произошла ошибка:'), error.message);
    process.exit(1);
  }
}

main();