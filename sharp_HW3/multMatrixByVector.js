// 
// written by Jesus C.
//
function multMatixByVector(matrix, vector) 
{
  let newVector = []; // holder for new vector
  for ( let i = 0; i < matrix.length; i++ ) // for the number of rows of the matrix how many sub vectors it has
  {
    let newVectorValue = 0; // start with 0 for the new value of each index
    for ( let j = 0; j < vector.length; j++ )  // for the length of the vector which is the same as the matrix row length
      newVectorValue += matrix[i][j] * vector[j]; // get the value of the new row from multiplying each row value against each vector row value and adding them together
    newVector.push(newVectorValue); // push the sum of those values to the index of the new
  }
  return newVector;
}
