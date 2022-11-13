# [is-on-water](https://is-on-water.balbona.me/)

Is-on-water is an API for determining if a point on earth is on water (ocean, river, or lake), or land


# API
https://is-on-water.balbona.me/api/v1/get/[latitude]/[longitude]

For more information, go to https://is-on-water.balbona.me/

# Development
1. You must have git lfs installed to download the dataset
2. Download the repository and install the dependencies:
```shell
git pull git@github.com:NiciusB/is-on-water.git
npm install
npm run dev
```

3. Now, you should be able to go to http://localhost:7301/ and view the site

4. To test your code, run:
```shell
npm run test
```
