<?php

include('database_connect.php');
//$idnum = $_POST['curSubID'];
$idnum = json_decode($_POST['curSubID']);
//$result = mysql_query('SELECT*FROM ` myresearch.expgamble`  WHERE  subid= + $idnum ');
//$result =mysql_query("SELECT * FROM  `myresearch.expgamble` WHERE subid=" + $idnum);
//$result =mysql_query("SELECT * FROM  expgamble` WHERE subid=6905427") ;
//$result  = mysql_query('SELECT subid FROM `expgamble` WHERE subid=69');
$result =mysql_query( "SELECT subject_id FROM  pungroup WHERE subject_id=" . $idnum) ;
$show=mysql_fetch_assoc($result);

if (!$result) {
    die('Invalid query: ' . mysql_error());
} else {
  //  print "successful search!";
    echo $show ;

}

//echo $show ;

/*if ($show=null) {
    echo 2;
} else {
  //  print "successful search!";
    echo $show ;

}*/

?>
