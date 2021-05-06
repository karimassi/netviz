$(function() {
    $("#btn-animation-network-pause").toggle()
})

$("#btn-animation-network-play").on("click", function() {
    $("#btn-animation-network-play").toggle()
    $("#btn-animation-network-pause").toggle()
  });

$("#btn-animation-network-pause").on("click", function() {
    $("#btn-animation-network-play").toggle()
    $("#btn-animation-network-pause").toggle()
});