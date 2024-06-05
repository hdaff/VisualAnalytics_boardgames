import * as druid from "@saehrimnir/druidjs";

export function LDA(data, useClasses) {
  // Ensure the data structure is correct
  data = data.map(game => ({
    ...game,
    rating: game.rating.rating,
    num_of_reviews: game.rating.num_of_reviews
  }));

  // Extract relevant numerical data for LDA
  let numberData = data.map(game => [
    game.year, game.minplayers, game.maxplayers, game.minplaytime,
    game.maxplaytime, game.minage, game.rating, game.num_of_reviews
  ]);

  // // Normalize numberData
  // for (let i = 0; i < numberData[0].length; i++) {
  //   let column = numberData.map(row => row[i]);
  //   let min = Math.min(...column);
  //   let max = Math.max(...column);
    
  //   // Avoid division by zero if min and max are the same
  //   if (min !== max) {
  //     numberData = numberData.map(row => {
  //       row[i] = (row[i] - min) / (max - min);
  //       return row;
  //     });
  //   }
  // }

  console.log("Normalized data", numberData);

  const classes = data.map(game => game.in_top_5_cat);
  const classes_2 = data.map(game => game.in_top_5_mech);
  const title = data.map(game => game.title);

  let labels;
  if (useClasses === "categoriesClass") {
    labels = classes;
  } else {
    labels = classes_2;
  }

  const X = druid.Matrix.from(numberData); // X is the data as object of the Matrix class.

  // Perform LDA
  const reductionLDA = new druid.LDA(X, { labels: labels, d: 2, seed: 1212 });
  const result = reductionLDA.transform();
  console.log("LDA Result:", result);

  if (!(result instanceof druid.Matrix)) {
    throw new Error("LDA transform did not return a Matrix instance");
  }

  // Convert Matrix to array
  const rows = result._rows;
  const cols = result._cols;
  const dataArray = [];
  for (let i = 0; i < rows; i++) {
    const row = [];
    for (let j = 0; j < cols; j++) {
      row.push(result._data[i * cols + j]);
    }
    row.push(classes[i]); 
    
    row.push(classes_2[i]);
    row.push(title[i]);
    dataArray.push(row);
  }

  console.log("Transformed Data Array:", dataArray);

  // Transform the array into the desired format

  return dataArray;
}
