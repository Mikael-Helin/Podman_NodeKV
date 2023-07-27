#!/bin/bash

start=`date +%s`
for i in {1..1000}
do
   curl --silent -X POST -H "Content-Type: application/json" -d '{"key":"testKey'$i'", "value":"testValue'$i'"}' http://localhost:8080/store?replace=true > /dev/null
done
end=`date +%s`
runtime=$((end-start))
echo "1000 single HTTP body inserts took ${runtime}s"


start=`date +%s`
for i in {1..1000}
do
   curl -s "http://localhost:8080/store/testKey$i?cmd=create&replace=true&values=testValue$i" > /dev/null
done
end=`date +%s`
runtime=$((end-start))
echo "1000 single path inserts took ${runtime}s"

start=`date +%s`
for i in {1..1000}
do
   curl -s "http://localhost:8080/store?cmd=create&replace=true&keys=$i&values=testValue$i" > /dev/null
done
end=`date +%s`
runtime=$((end-start))
echo "1000 single query inserts took ${runtime}s"


start=`date +%s`
for j in {1..1000}
do
  data='{'
  for i in {1..50}
  do
    index=$(( 50 * (j - 1) + i ))
    pair="\"testKey$index\": \"testValue$index\""
    data+=$pair
    if [ $i -lt 50 ]
    then
      data+=','
    fi
  done
  data+='}'
  curl -s -X POST -H "Content-Type: application/json" -d "$data" "http://localhost:8080/store?replace=true" > /dev/null
done
end=`date +%s`
runtime=$((end-start))
echo "1000x 50-batch inserts took ${runtime}s"

start=`date +%s`
for i in {1..1000}
do
   curl -s "http://localhost:8080/store/key1?cmd=create&replace=true&keys=key1&values=testValue1" > /dev/null
done
end=`date +%s`
runtime=$((end-start))
echo "1000 single responses took ${runtime}s"
