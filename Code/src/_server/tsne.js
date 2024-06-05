import * as druid from "@saehrimnir/druidjs";

export function TSNE(data) {
    // Map data to retain name, dataPoint, and centroids
    const dataPoints = data.map(dataPoint => dataPoint.dataPoint);

    // Convert dataPoints to druid Matrix
    const X = druid.Matrix.from(dataPoints);

    // Initialize TSNE
    const tsne = new druid.TSNE(X, { d: 2, perplexity: 30, seed: 1212 });

    // Perform the transformation
    const result = tsne.transform();

    // Check if result is an instance of druid.Matrix
    if (!(result instanceof druid.Matrix)) {
        throw new Error("TSNE transform did not return a Matrix instance");
    }

    // Convert Matrix to array
    const rows = result._rows;
    const cols = result._cols;
    let transformedData = [];
    for (let i = 0; i < rows; i++) {
        let row = [];
        for (let j = 0; j < cols; j++) {
            row.push(result.get(i, j));
        }
        transformedData.push(row);
    }
    // transform to original format
    transformedData = transformedData.map((row, index) => ({
        dataPoint: row,
        name: data[index].name,
        centroids : data[index].centroids,
    }));
    return transformedData;
}
