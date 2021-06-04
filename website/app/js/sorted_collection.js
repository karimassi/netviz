/**
 * Returns the last element of the given array. Assumes that the length is > 0
 */
Array.prototype.last = function() {
  return this[this.length - 1];
};

class SortedCollection {
  /**
   * Collection that keeps an array of the given size, such that all values
   *  are at all time sorted according to the ordering specified by comparator
   */
  constructor(size, comparator) {
    this.arr = new Array(size).fill(undefined);
    this.effectiveSize = 0;
    this.size = size;
    this.comparator = comparator;
    this.lastIndex = this.arr.length - 1;
  }

  /**
   * Inserts the value in the index of the array where it should fit, possibly
   *  moving other elements around in the process 
   */
  tryToInsert(value) {
    if(this.last === undefined || this.comparator(value, this.last)) {
      let i;
      for(i = this.lastIndex;
          i >= 0 && (this.arr[i] === undefined || this.comparator(value, this.arr[i]));
          i--) {
        if(i < this.lastIndex) {
          this.arr[i + 1] = this.arr[i];
        }
      }
      if(i < this.lastIndex) {
          this.arr[i + 1] = value;
      }
    }
  }
}
