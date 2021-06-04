Array.prototype.last = function() {
  return this[this.length - 1];
};

class SortedCollection {
  constructor(size, comparator) {
    this.arr = new Array(size).fill(undefined);
    this.effectiveSize = 0;
    this.size = size;
    this.comparator = comparator;
    this.lastIndex = this.arr.length - 1;
  }

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
