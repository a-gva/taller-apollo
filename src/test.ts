async function fetchData() {
  const data = await fetch('https://api.example.com/data');
  const json = await data.json();
  const status = data.status;
  let error = null;
  if (status !== 200) {
    console.error('Failed to fetch data');
    error = 'Failed to fetch data';
    return {
      data: null,
      status,
      error,
    };
  }
  return {
    data: json,
    status,
    error: status !== 200 ? error : null,
  };
}
