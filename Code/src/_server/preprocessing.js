/**
 * Helper function to preprocess the data
 */

/**
 * # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # #
 *
 * !!!!! Here an below, you can/should edit the code  !!!!!
 * - you can modify the data preprocessing functions
 * - you can add other data preprocessing functions for other functionalities
 *
 * # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # #
 */
/**
 * Returns boolean value, whether given row meets parameter conditions
 * @param {*} parameters
 * @param {*} row
 * @returns boolean
 */
export function is_below_max_weight(parameters, row) {
  return row.weight < parameters.max_weight
}
/**
 * Calculates the bmi for a specific person
 * @param {age, height, name, weight} person
 * @returns {age, bmi, height, name, weight}
 */
export function calc_bmi(person) {
  person.bmi = person.weight / ((person.height / 100) * (person.height / 100))
  return person
}
/**
 * Converts all attribute values to float, than can be converted
 * @param {*} obj
 * @returns {*}
 */
export function parse_numbers(obj) {
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      if (!isNaN(obj[key])) {
        obj[key] = parseFloat(obj[key])
      }
    }
  }
  return obj
}
/**
 * Test add function to demonstrate testing with jest in file preprocessing.test.js
 *
 * Adds the input numbers
 * @param {number} a 
 * @param {number} b
 * @returns number
 */
export function test_func_add(a, b) {
  return a + b
}


/**
 * Filters out the top X ranked games from the provided array of games.
 * @param {Array} games - The array of game objects.
 * @param {number} x - The number of top ranked games to filter.
 * @returns {Array} - An array containing the top X ranked games.
 */
export function filterTopRankedGames(games, x) {
  // Sort the games based on their ranks in ascending order
  const sortedGames = games.sort((a, b) => a.rank - b.rank);
  
  // Return the top X ranked games
  return sortedGames.slice(0, x);
}

/**
 * Selects games within a certain category from the provided array of games.
 * @param {Array} games - The array of game objects.
 * @param {string} category - The category to filter by.
 * @returns {Array} - An array containing games within the specified category.
 */
export function selectGamesByCategory(games, category) {
  if (category === 'all') {
    return games;
  } else {
   
    return games.filter(game => {
      
      return game.types.categories.some(cat => cat.name === category);
    });
  }
}


export function selectGamesByMechanic(games, mechanic) {
  if(mechanic === 'all') return games;
  else{
    return games.filter(game => {
    
      return game.types.mechanics.some(mech => mech.name === mechanic);
    });
  }
  
}

export function in_top_5_popular_categories(games) {
  const top_5_categories = [
    'Economic', 'Fantasy', 'Science Fiction', 'Adventure', 'Fighting'
  ];

  games.forEach(game => {
    game.in_top_5_cat = game.types.categories.some(cat => top_5_categories.includes(cat.name));
  });
}

export function in_top_5_popular_mechanics(games){
  let top_5_mechanics = [
    'Hand Management',
    'Solo / Solitaire Game',
    'Variable Player Powers',
    'Variable Set-up',
    'Worker Placement',
    
];
  games.forEach(game => {
    game.in_top_5_mech = game.types.mechanics.some(mech => top_5_mechanics.includes(mech.name));
  });
}

export function removeColumnsWithMissingValues(data){
  // if a column has under 990 non null values, remove it
  const threshold = 990;
  let columns = data.columns;
  let rows = data.rows;
  let columnsToRemove = [];
  columns.forEach(column => {
    let nonNullValues = rows.filter(row => row[column] !== null).length;
    if(nonNullValues < threshold){
      columnsToRemove.push(column);
    }
  })
  columnsToRemove.forEach(column => {
    delete data[column];
  })
  return data;
}

export function removeRowsWithMissingValues(data){
  let rows = data.rows;
  let columns = data.columns;
  let rowsToRemove = [];
  rows.forEach(row => {
    let missingValues = columns.filter(column => row[column] === null).length;
    if(missingValues > 0){
      rowsToRemove.push(row);
    }
  })
}
export function mergeTwoDatasets(data1,data2){
  //merge on left join, key is game_id from data1 and id from data2
  let mergedData = data1.map(row => {
    let row2 = data2.find(row2 => row2.bgg_id === row.ID);
    return {...row, ...row2};
  })
}

/**
 * @param {Array} data - The array of game objects.
 * @param {Array} columns - The array of column names to extract.
 * @returns {Array} - An array containing the relevant columns from the data.
 */

 
export function extractRelevantColumns(data, parameters) {
  return data.map(row => {
    let newRow = {};
    newRow['Name'] = row['Name'];
    parameters.forEach(column => {
      if (column === 'game_type') {
        // Extract 8 binary columns
        let gameType = row[column];
        
        newRow['Abstract_Game'] = gameType.includes('Abstract Game') ? 1 : 0;
        newRow['Children_Game'] = gameType.includes("Children's Game") ? 1 : 0;
        newRow['Customizable'] = gameType.includes('Customizable') ? 1 : 0;
        newRow['Family_Game'] = gameType.includes('Family Game') ? 1 : 0;
        newRow['Party_Game'] = gameType.includes('Party Game') ? 1 : 0;
        newRow['Strategy_Game'] = gameType.includes('Strategy Game') ? 1 : 0;
        newRow['Thematic'] = gameType.includes('Thematic') ? 1 : 0;
        newRow['War_Game'] = gameType.includes('War Game') ? 1 : 0;
      } else {
        newRow[column] = row[column];
      }
    });
    
    return newRow;
  });
 
}

export function normalizeData(data) {
  if (!Array.isArray(data) || data.length === 0) {
    throw new Error('Data should be a non-empty array');
  }

  // Extract column names from the first data object
  let columns = Object.keys(data[0]);
  let normalizedData = data.map(row => ({ Name: row.Name })); // Initialize with names

  columns.forEach(column => {
    if (column !== 'Name') {
      let values = data.map(row => parseFloat(row[column]));
      
      // Filter out non-numeric values
      values = values.filter(value => !isNaN(value));

      if (values.length === 0) {
        normalizedData.forEach(row => row[column] = 0);
        return;
      }

      let min = Math.min(...values);
      let max = Math.max(...values);

      // Handle case where max and min are the same to avoid division by zero
      if (max === min) {
        normalizedData.forEach(row => row[column] = 0);
      } else {
        data.forEach((row, index) => {
          let value = parseFloat(row[column]);
          normalizedData[index][column] = isNaN(value) ? 0 : (value - min) / (max - min);
        });
      }
    }
  });

  return normalizedData;
}

export function transformToKMeansInput(normalizedData) {
  return normalizedData.map(row => ({
    name: row.Name,
    dataPoint: Object.keys(row).filter(key => key !== 'Name').map(key => row[key])
  }));
}


export function transformFromKMeansOutput(kMeansResults, originalKeys) {
  const transformedData = {};

  // Initialize the transformedData object with empty arrays for each key
  originalKeys.forEach(key => {
    transformedData[key] = [];
  });

  // Populate the transformedData object
  kMeansResults.forEach(result => {
    result.dataPoint.forEach((value, index) => {
      transformedData[originalKeys[index]].push(value);
    });
  });

  // Add centroid index to the transformedData as the last feature column
  
  transformedData.centroidIndex = kMeansResults.map(result => result.centroidIndex);


  return transformedData;
}



