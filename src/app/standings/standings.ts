import { Component } from '@angular/core';

@Component({
  selector: 'app-standings',
  imports: [],
  templateUrl: './standings.html',
  styleUrl: './standings.css',
})
export class Standings {
  rows = [
    {
      rank: 1,
      name: 'College of Criminal Justice Education',
      gold: 3,
      silver: 2,
      bronze: 1,
      total: 6,
      color: '#ef4444',
    },
    {
      rank: 2,
      name: 'College of Business, Entrepreneurship and Accountancy',
      gold: 1,
      silver: 3,
      bronze: 2,
      total: 6,
      color: '#3b82f6',
    },
    {
      rank: 3,
      name: 'College of Hospitality Management',
      gold: 2,
      silver: 2,
      bronze: 2,
      total: 6,
      color: '#10b981',
    },
    {
      rank: 4,
      name: 'College of Industrial Technology',
      gold: 0,
      silver: 2,
      bronze: 3,
      total: 5,
      color: '#6366f1',
    },
    {
      rank: 5,
      name: 'College of Information and Computing Sciences',
      gold: 4,
      silver: 1,
      bronze: 2,
      total: 7,
      color: '#ec4899',
    },
    {
      rank: 6,
      name: 'College of Teacher Education',
      gold: 1,
      silver: 2,
      bronze: 4,
      total: 7,
      color: '#14b8a6',
    },
    {
      rank: 7,
      name: 'College of Fisheries (and Aquatic Sciences)',
      gold: 2,
      silver: 1,
      bronze: 3,
      total: 6,
      color: '#8b5cf6',
    },
  ];
}
