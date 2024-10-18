import { useState, useEffect, useContext } from "react";
import { useNavigate } from 'react-router-dom'
import { useFormik, FieldArray, Formik, Field, Form } from "formik";
import { UserContext } from '../../context/UserContext'
import toast from "react-hot-toast";
import { object, string, array, number, bool } from "yup";
import {OpenAI} from 'openai'
import StraightenIcon from '@mui/icons-material/Straighten';
import BlockIcon from '@mui/icons-material/Block';
import LocalGroceryStoreIcon from '@mui/icons-material/LocalGroceryStore';
import Loading from '../../components/Loading'
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import CloseIcon from '@mui/icons-material/Close';
import Dropzone from 'react-dropzone'
import UploadFileIcon from '@mui/icons-material/UploadFile';


const secretKey = import.meta.env.VITE_OPENAI_SECRET_KEY
const openai = new OpenAI({

  apiKey: secretKey,
  dangerouslyAllowBrowser: true

})


function GenerateRecipe() {
  const { user, updateRecipes } = useContext(UserContext)
  const [generatedRecipe, setGeneratedRecipe] = useState(null)
  const [isLoaded, setIsLoaded] = useState(true)
  const [isGenerated, setIsGenerated] = useState(true)
  const [addGenRecipe, setAddGenRecipe] = useState(false)
  const [files, setFiles] = useState([])
  const nav = useNavigate()

  const handleAddGenRecipe = () => {
    setAddGenRecipe(!addGenRecipe)
  }

  const recipeSchema = object({
    name: string()
    .max(50, 'Name must be 50 characters or less')
    .required('Name is required'),
    instructions: string()
    .max(2000, 'Must be 2000 characters or less'),
    source: string()
    .max(50, 'Source must be 50 characters or less'),
    category: string()
    .required('Category is required')
    .oneOf(['Breakfast', 'Lunch', 'Dinner', 'Snack', 'Dessert']),
    prep_time: string()
    .required('Prep Time is required'),
    ingredients: array().of(
      object({
        name: string()
        .max(50, 'Name must be 50 characters or less')
        .required('Name is required'),
        amount: number('Must be a number')
        .required('Amount is required'),
        measurement_unit: string()
        .oneOf(['tsp', 'tbsp', 'cups', 'pt', 'qt', 'gal', 'oz', 'fl oz', 'lb', 'unit'], 'Must match approved units'),
      }),
    ),
  });

  const initialRecipeValues = {
    name: "",
    instructions: "",
    category: "",
    prep_time: "",
    source: "",
    ingredients: [
      {
        name: "",
        amount: "",
        measurement_unit: "unit",
      }
    ],
  };

  const recipeGenSchema = object({
    added_ingredients: bool()
    .required('Please specify if you want ingredients added'),
    restrictions: string()
    .oneOf(['None', 'Vegetarian', 'Pescitarian', 'Peanut Allergy'])
    .required('Please provide dietary restrictions'),
    strictness: number()
    .min(1, "Must not be less than 1")
    .max(10, "Must not be greater than 10")
    .required(),
    ingredients: array().of(
      object({
        name: string()
        .max(50, 'Name must be 50 characters or less')
        .required('Name is required'),
        amount: number('Must be a number')
        .required('Amount is required'),
        measurement_unit: string()
        .oneOf(['tsp', 'tbsp', 'cups', 'pt', 'qt', 'gal', 'oz', 'fl oz', 'lb', 'unit'], 'Must match approved units'),
      }),
    ),
  });

  const initialValues = {
    added_ingredients: false,
    restrictions: "None",
    strictness: 1,
    ingredients: [
      {
        name: "",
        amount: "",
        measurement_unit: "Unit",
      }
    ],
  };

  const recipeFormik = useFormik({
    initialValues: initialRecipeValues,
    validationSchema: recipeSchema,
    onSubmit: (formData) => {

      formData['ingredients'] = JSON.stringify(formData['ingredients'])

      const fd = new FormData()

      if(files[0] !== undefined) {
        fd.set("image_file", files[0])
      }

      for(let key in formData) { fd.set(key, formData[key])}

      fetch("/api/v1/recipes", {
        method: "POST",
        body: fd,
      })
      .then((res) => {
        if (res.ok) {
          return res.json().then((data) => {
            updateRecipes([...user.recipes, data])
            handleAddGenRecipe()
            nav("/generate-recipes");
            toast.success("Recipe Created");
          });
        } else {

          return res.json().then((data) => {


            const message = data.Error
            toast.error(message)
          })
        }
      });






    },
  });

  const formik = useFormik({
    initialValues,
    validationSchema: recipeGenSchema,
    onSubmit: (formData) => {

      setIsGenerated(false)

      openai.chat.completions.create({
        model: 'gpt-4',
        temperature: 0.5,
        messages: [{role: "user", content: `


          Could you generate a recipe for me based on the following ingredients? I only have these ingredients and NOTHING ELSE.



          ${formData.restrictions ?
            `Remove any ingredients that would violate a ${formData.restrictions} diet`
            :
            '' }

            IF the ingredients are not generally used together, add a message to the notes saying the recipe could end up being strange or unappetizing. If the ingredients could go well together do not add any messages to notes.

            ONLY INCLUDE THE JSON

            Please return the recipe in a parseable JSON format
            {
              "name": "recipeName",
              "ingredients": [{"name": "ingredientName", "amount": "amount", "measurement_unit": ""}],
              "prep_time": "",
              "category" : "",
              "instructions":"",
              "notes": ""

            }

            "name" must be less than 50 characters
            "prep_time" must be one of the following ('>5min', '5-30 min', '30-60 min', '1-3 hr', 'All Day')
            "category" must be one of the following ('Breakfast', 'Lunch', 'Dinner', 'Snack', 'Dessert')
            "instructions" must be less than 2000 characters
            "ingredient.measurement_unit" Must be one of the following ('tsp', 'tbsp', 'cups', 'pt', 'qt', 'gal', 'oz', 'fl oz', 'lb', 'unit')
            "ingredient.name" Must be less than 50 characters
            "ingredient.amount" Must be less than 1000
            "notes" Must be less than 2000 characters

            ${formData.ingredients.map((ingredient) =>  `${ingredient.amount} ${ingredient.measurement_unit} of ${ingredient.name} `)}

            ${formData.added_ingredients ?
              'Add extra ingredients to the ingredients array that would make the recipe better and as delicous as possible'
            :

              'Do not add any ingredients that I do not list as available ingredients. I DO NOT HAVE ANYTHING OTHER THAN WHAT I LIST BELOW. ONLY PUT THOSE IN THE RECIPE.'
          }

          ${formData.strictness ?
            `On a scale of 1 out of 10 (1 being normal recipes and 10 being very bizzarre experimental dishes) Generate a recipe that is a ${formData.strictness} out of 10`
          :

            'Do not add any ingredients that I do not list as available ingredients. I DO NOT HAVE ANYTHING OTHER THAN WHAT I LIST BELOW. ONLY PUT THOSE IN THE RECIPE.'
        }

        `
        }]
      }).then(resp => {

        const json = resp.choices[0].message.content
        const parsedJson = JSON.parse(json)
        setGeneratedRecipe(parsedJson)
        setIsGenerated(true)

      })


    },
  });

  useEffect(() => {
    if(generatedRecipe) {
      recipeFormik.setValues({
        name: generatedRecipe.name,
        instructions: generatedRecipe.instructions,
        category: generatedRecipe.category,
        source: generatedRecipe.source,
        prep_time: generatedRecipe.prep_time,
        ingredients: generatedRecipe.ingredients.map((ingredient) => ({
          name: ingredient.name,
          amount: ingredient.amount,
          measurement_unit: ingredient.measurement_unit
        }))
      });

    }
  },[generatedRecipe])


  return (

    <>
    {
      isLoaded ?

      <div className="h-[92%] flex flex-col px-6">

        {/* Page Header */}
        <div className="h-[5%] flex items-center">
              <p className="text-2xl tracking-wide">AI Recipe Generator</p>
        </div>

        {/* Main Body */}
        <div className='h-[95%] flex flex-col gap-4 pb-4 sm:flex-row'>

          {/* Recipe Options */}
          <div className="h-[50%] w-full sm:h-full sm:w-[50%] bg-shittake text-black p-4 rounded-xl">

            <Formik initialValues={initialValues} onSubmit={formik.handleSubmit}>
              <Form className="flex h-full flex-col gap-2 text-white justify-between" onSubmit={formik.handleSubmit}>

                {/* Recipe Options Label */}
                <div className='h-[5%] flex justify-between items-center'>
                  <p className='text-lg tracking-wide'>Recipe Options</p>
                  <button className='bg-gray rounded-xl text-black p-1 hover:bg-champagne' onClick={formik.resetForm}>
                    Reset Form
                  </button>

                </div>


                {/* Recipe Options Body */}
                <div className='sm:h-[90%] border text-base flex flex-col gap-4 overflow-x-hidden border-white overflow-y-scroll scrollbar scrollbar-thumb-champagne'>

                  {/* Ingredient Fields */}
                  <div className='flex flex-col gap-[4px]'>


                  <div className='w-full border-b'>
                    <label className='text-xl' >
                      Ingredients
                    </label>
                  </div>

                  <FieldArray name="ingredients" validateOnChange={true}>
                    {(fieldArrayProps) => {
                      const ingredients = formik.values.ingredients || [];

                      const handleAddIngredient = () => {
                        formik.setFieldValue('ingredients', [...ingredients, { name: "", amount: "", measurement_unit: "unit" }]);
                      };

                      const handleDeleteIngredient = (index) => {

                        if (index !== 0) {

                          const updatedIngredients = [...formik.values.ingredients]
                          updatedIngredients.splice(index, 1)
                          formik.setFieldValue('ingredients',updatedIngredients)

                        } else if (index === 0) {
                          formik.setFieldValue('ingredients[0]', { name: "", amount: "", measurement_unit: "unit" })
                        }

                      }

                      return (
                        <>
                          {ingredients.map((ingredient, index) => (
                            <div key={index} className="flex flex-row w-full gap-1 text-sm">

                              {/* Ingredient Number */}
                              <div className='w-[3%] sm:w-[5%] h-full flex justify-center items-start'>
                                <p className='text-xl flex items-center'>{index >= 0 ? index + 1 : ''}</p>
                              </div>

                              {/* Ingredient Name */}
                              <Field name={`ingredients[${index}].name`}
                                value={
                                  formik.values.ingredients[index]
                                    ? formik.values.ingredients[index].name
                                    : ""
                                }
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                placeholder="Name"
                                className="border rounded-md p-1 w-[50%] text-black sm:w-[50%]"/>


                              {/* Ingredient Amount */}
                              <Field name={`ingredients[${index}].amount`}
                                placeholder="#"
                                type='number'
                                value={
                                  formik.values.ingredients[index]
                                    ? formik.values.ingredients[index].amount
                                    : ""
                                }
                                onBlur={formik.handleBlur}
                                onChange={formik.handleChange}
                                step='1'
                                min="1"
                                max="10000"
                                className="border rounded-md p-1 text-black w-[10%]"/>

                              {/* Ingredient Measurement */}
                              <Field as='select'
                                name={`ingredients[${index}].measurement_unit`}
                                placeholder="Unit"
                                value={
                                  formik.values.ingredients[index]
                                    ? formik.values.ingredients[index].measurement_unit
                                    : ""
                                }
                                onBlur={formik.handleBlur}
                                onChange={formik.handleChange}
                                className="border text-black rounded-md p-1 w-[25%] sm:w-[30%]">

                                  <option value='unit'>Unit</option>
                                  <option value='tsp'>Teaspoon</option>
                                  <option value='tbsp'>Tablespoon</option>
                                  <option value='cups'>Cup</option>
                                  <option value='pt'>Pint</option>
                                  <option value='qt'>Quart</option>
                                  <option value='gal'>Gallon</option>
                                  <option value='oz'>Ounce</option>
                                  <option value='fl oz'>Fluid Ounce</option>
                                  <option value='lb'>Pound</option>

                              </Field>

                              {/* Add + Delete Buttons */}
                              <div className={`w-[14%] flex flex-row`}>
                                {/* Remove Ingredient */}
                                <button type="button" onClick={() => handleDeleteIngredient(index)} className="rounded-lg">
                                  <RemoveIcon />
                                </button>

                                {/* Add Ingredient */}
                                <button type="button" onClick={handleAddIngredient} className="rounded-lg">
                                  <AddIcon />
                                </button>
                              </div>


                            </div>
                          ))}
                        </>
                      );
                    }}
                  </FieldArray>


                  {formik.errors.ingredients && formik.touched.ingredients ? (

                    formik.touched.ingredients.map((ing, index) => {
                      if(Object.values(ing).every(value => value === true) && formik.errors.ingredients[index]) {
                        const errors = formik.errors.ingredients[index]
                        return Object.entries(errors).map(err =>
                          <div className="text-white flex gap-1 flex items-end text-base">
                            <p>❌</p>
                            <p className='text-xl'>{index + 1}:</p>
                            <p>{err[1]}</p>
                          </div>
                        )

                      }

                    })

                  )
                  :
                  <></>
                  }

                  </div>

                  {/* Option Fields */}
                  <div className='w-full flex flex-col gap-2'>

                    <div className='w-full border-b'>
                      <label className='text-xl' >
                        Options
                      </label>
                    </div>

                    {/* Restrictions */}
                    <div className='flex items-center justify-between px-2'>
                      <div>
                        <BlockIcon  className='mr-2'/>
                        <label htmlFor="settings" className='text-lg'>Restrictions</label>
                        <p className='text-sm'>Allergy or Dietary Restrictions</p>

                      </div>
                      <select
                        name={`restrictions`}
                        value={
                          formik.values.restrictions
                            ? formik.values.restrictions
                            : ""
                        }
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        min='1'
                        max='10'
                        className='border text-black rounded-md p-1 min-w-[20%] h-[70%] sm:min-w-[25%]'
                      >
                        <option value='None'>None</option>
                        <option value='Vegetarian'>Vegetarian</option>
                        <option value='Pescitarian'>Pescitarian</option>
                        <option value='Peanut Allergy'>Peanut Allergy</option>
                      </select>
                    </div>

                    {formik.errors.restrictions && formik.touched.restrictions && (
                          <div className="text-white flex items-center">❌  {formik.errors.restrictions}</div>
                      )}

                    {/* Added Ingredients */}
                    <div className='flex items-center justify-between px-2'>
                      <div>
                        <LocalGroceryStoreIcon  className='mr-2'/>
                        <label htmlFor="settings" className='text-lg'>Added Ingredients</label>
                        <p className='text-sm'>Allow unlisted ingredients to be added</p>
                      </div>
                      <input
                        name={`added_ingredients`}
                        value={
                          formik.values.added_ingredients
                            ? formik.values.added_ingredients
                            : ""
                        }
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        type="checkbox"
                        className="size-6 text-shittake bg-champagne rounded "
                      />


                    </div>
                      {formik.errors.added_ingredients && formik.touched.added_ingredients && (
                          <div className="text-white flex items-center">❌  {formik.errors.added_ingredients}</div>
                      )}

                    {/* Strictness */}
                    <div className='flex items-center justify-between px-2'>
                      <div>
                        <StraightenIcon  className='mr-2'/>
                        <label>Strictness</label>
                        <p className='text-xs'>Allow the model to get creative (1: Least 10: Most )</p>
                      </div>
                      <input
                        name={`strictness`}
                        value={
                          formik.values.strictness
                            ? formik.values.strictness
                            : ""
                        }
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        type='number'
                        min='1'
                        max='10'
                        className='border text-black rounded-md p-1 h-[70%] min-w-[5%] sm:min-w-[10%]'
                      />

                    </div>
                      {formik.errors.strictness && formik.touched.strictness && (
                          <div className="text-white flex items-center">❌  {formik.errors.strictness}</div>
                      )}

                  </div>


                </div>

                {/* Search Button */}
                <button className="sm:h-[5%] bg-champagne text-black rounded-xl pb-1 text-center" type="submit">
                  Generate Recipe 🍄🧙🏼‍♂️
                </button>

              </Form>
            </Formik>

          </div>

          {/* Recipe Results */}
          <div className="h-[50%] w-full sm:h-full sm:w-[50%] flex items-center justify-center">


          { isGenerated ?

            <>
            {
              generatedRecipe ?

              <div className='size-[95%] sm:size-[85%] flex gap-4 flex-row sm:flex-col'>

                {/* Add Generated Recipe Button */}
                <div className='w-[15%] sm:w-full bg-shittake text-white text-center p-1 flex items-center justify-center rounded-xl text-lg hover:bg-champagne hover:text-shittake' onClick={handleAddGenRecipe}>
                  <p className='hidden sm:block flex items-center'>Save Recipe <AddIcon /></p>

                  <div className='block flex items-center justify-center sm:hidden text-lg text-white'>
                    <AddIcon style={{width: '30px', height: '30px'}}/>
                  </div>
                </div>

                {/* Generated Recipe Preview */}
                <div className='bg-champagne rounded-xl flex flex-col gap-2 overflow-y-scroll scrollbar scrollbar-thumb-shittake p-2'>
                  <p className='text-3xl sm:text-4xl tracking-wide'>
                    {generatedRecipe.name}
                  </p>
                  <p className='text-white text-sm bg-shittake rounded-xl p-1 my-2 mx-1 sm:mx-2'>
                    <p className='text-2xl'>👩🏽‍🍳💬</p>
                    "{generatedRecipe.notes}"
                  </p>

                  <p className='text-lg'>Prep Time: {generatedRecipe.prep_time}</p>
                  <p className='text-lg'>Category: {generatedRecipe.category}</p>

                  <div className='w-full border-b'>
                    <label className='text-xl' >
                      Ingredients
                    </label>
                  </div>

                  <div className=''>
                    {generatedRecipe.ingredients.map((ingredient,index) =>
                    <div key={index} className='flex flex-row gap-2 items-end'>
                      <p className=""> {ingredient.amount} </p>
                      <p className="tracking-wide">{ingredient.measurement_unit}</p>
                      <p>{'<>'}</p>
                      <p>{ingredient.name}</p>

                    </div>) }
                  </div>
                  <div className='w-full border-b'>
                    <label className='text-xl' >
                      Instructions
                    </label>
                  </div>
                  <div className='text-base'>

                    {generatedRecipe.instructions}
                  </div>
                </div>

              </div>


              :
              <div className='h-full flex flex-col items-center justify-center'>
                <p className='text-2xl sm:text-4xl bg-champagne rounded-xl p-2 flex text-center italic'>Please Input Recipe Options</p>
              </div>
            }
            </>
            :

            <Loading />

          }
          </div>

        </div>


      </div>

      :

      <Loading />



    }

    {/* Add Generated Recipe */}
    {addGenRecipe && (
            <div className="fixed inset-0 flex justify-center items-center transition-colors backdrop-blur">
              <Formik onSubmit={recipeFormik.handleSubmit} initialValues={initialRecipeValues}>
                <Form className="size-[95%] text-md sm:size-[90%] flex flex-col justify-center items-center">

                  {/* Form Exit */}
                  <div className='h-[4%] w-full flex items-start '>
                    <button className="bg-champagne border text-black rounded-xl flex justify-center w-full " type="button" onClick={handleAddGenRecipe}>
                      <CloseIcon style={{size: '50px'}}/>
                    </button>
                  </div>

                  {/* Form Fields */}

                  <div className='h-[92%] w-full bg-white rounded-lg p-2 border border-shittake flex flex-col gap-2 overflow-y-scroll scrollbar scrollbar-thumb-shittake text-base'>

                      {/* Name Field */}
                      <div className='flex flex-col gap-[4px]'>

                        <label htmlFor="name">
                          Name
                        </label>


                        <input
                          type="text"
                          name="name"
                          onChange={recipeFormik.handleChange}
                          onBlur={recipeFormik.handleBlur}
                          value={recipeFormik.values.name}
                          className="border rounded-md p-1"
                          placeholder="Name your recipe"
                          />

                          {recipeFormik.errors.name && recipeFormik.touched.name && (
                            <div className="text-shittake flex items-center">❌  {recipeFormik.errors.name}</div>
                          )}

                      </div>

                      {/* Category Field */}
                      <div className='flex flex-col gap-[4px]'>

                        <label htmlFor="category">
                          Category
                        </label>

                        <select
                        as='select'
                        name="category"
                        onChange={recipeFormik.handleChange}
                        onBlur={recipeFormik.handleBlur}
                        value={recipeFormik.values.category}
                        className="border rounded-md p-1"
                        placeholder="Category"
                        >
                          <option value='' className='bold italic'>Select Category</option>
                          <option value='Breakfast'>🥣 Breakfast</option>
                          <option value='Lunch'>🥪 Lunch</option>
                          <option value='Dinner'>🍽️ Dinner</option>
                          <option value='Snack'>🍎 Snack</option>
                          <option value='Dessert'>🍦 Dessert</option>
                        </select>


                        {recipeFormik.errors.category && recipeFormik.touched.category && (
                          <div className="text-shittake flex items-center">❌  {recipeFormik.errors.category}</div>
                        )}

                      </div>

                      {/* Ingredients Field */}
                      <div className='flex flex-col gap-[4px]'>

                        <label htmlFor="ingredients">
                          Ingredients
                        </label>

                        <FieldArray name="ingredients" validateOnChange={true}>
                          {(fieldArrayProps) => {
                            const ingredients = recipeFormik.values.ingredients || [];

                            const handleAddIngredient = () => {
                              recipeFormik.setFieldValue('ingredients', [...ingredients, { name: "", amount: "", measurement_unit: "unit" }]);
                            };

                            const handleDeleteIngredient = (index) => {

                              if (index !== 0) {

                                const updatedIngredients = [...recipeFormik.values.ingredients]
                                updatedIngredients.splice(index, 1)
                                recipeFormik.setFieldValue('ingredients',updatedIngredients)

                              } else if (index === 0) {
                                recipeFormik.setFieldValue('ingredients[0]', { name: "", amount: "", measurement_unit: "unit" })
                              }

                            }

                            return (
                              <>
                                {ingredients.map((ingredient, index) => (
                                  <div key={index} className="flex flex-row w-full gap-1 text-sm sm:text-base">

                                    {/* Ingredient Number */}
                                    <div className='w-[3%] sm:w-[5%] h-full text-black flex justify-center items-start'>
                                      <p className='text-xl flex items-center'>{index >= 0 ? index + 1 : ''}</p>
                                    </div>

                                    {/* Ingredient Name */}
                                    <Field name={`ingredients[${index}].name`}
                                      value={
                                        recipeFormik.values.ingredients[index]
                                          ? recipeFormik.values.ingredients[index].name
                                          : ""
                                      }
                                      onChange={recipeFormik.handleChange}
                                      onBlur={recipeFormik.handleBlur}
                                      placeholder="Name"
                                      className="border rounded-md p-1 w-[50%] sm:w-[50%]"/>


                                    {/* Ingredient Amount */}
                                    <Field name={`ingredients[${index}].amount`}
                                      placeholder="#"
                                      type='number'
                                      value={
                                        recipeFormik.values.ingredients[index]
                                          ? recipeFormik.values.ingredients[index].amount
                                          : ""
                                      }
                                      onBlur={recipeFormik.handleBlur}
                                      onChange={recipeFormik.handleChange}
                                      step='1'
                                      min="1"
                                      max="10000"
                                      className="border rounded-md p-1 w-[10%]"/>

                                    {/* Ingredient Measurement */}
                                    <Field as='select'
                                      name={`ingredients[${index}].measurement_unit`}
                                      placeholder="Unit"
                                      value={
                                        recipeFormik.values.ingredients[index]
                                          ? recipeFormik.values.ingredients[index].measurement_unit
                                          : ""
                                      }
                                      onBlur={recipeFormik.handleBlur}
                                      onChange={recipeFormik.handleChange}
                                      className="border rounded-md p-1 w-[25%] sm:w-[30%]">

                                        <option value='unit'>Unit</option>
                                        <option value='tsp'>Teaspoon</option>
                                        <option value='tbsp'>Tablespoon</option>
                                        <option value='cups'>Cup</option>
                                        <option value='pt'>Pint</option>
                                        <option value='qt'>Quart</option>
                                        <option value='gal'>Gallon</option>
                                        <option value='oz'>Ounce</option>
                                        <option value='fl oz'>Fluid Ounce</option>
                                        <option value='lb'>Pound</option>

                                    </Field>

                                    {/* Add + Delete Buttons */}
                                    <div className={`w-[14%] sm:w-[7%] flex flex-row`}>
                                      {/* Remove Ingredient */}
                                      <button type="button" onClick={() => handleDeleteIngredient(index)} className="text-black rounded-lg">
                                        <RemoveIcon />
                                      </button>

                                      {/* Add Ingredient */}
                                      <button type="button" onClick={handleAddIngredient} className="text-black rounded-lg">
                                        <AddIcon />
                                      </button>
                                    </div>


                                  </div>
                                ))}
                              </>
                            );
                          }}
                        </FieldArray>


                        {recipeFormik.errors.ingredients && recipeFormik.touched.ingredients ? (

                          recipeFormik.touched.ingredients.map((ing, index) => {
                            if(Object.values(ing).every(value => value === true) && recipeFormik.errors.ingredients[index]) {
                              const errors = recipeFormik.errors.ingredients[index]
                              return Object.entries(errors).map(err =>
                                <div className="text-shittake flex gap-1 flex items-end text-base">
                                  <p>❌</p>
                                  <p className='text-xl'>{index + 1}:</p>
                                  <p>{err[1]}</p>
                                </div>
                              )

                            }

                          })

                        )
                        :
                        <></>
                        }



                      </div>

                      {/* Prep Time Field */}
                      <div className='flex flex-col gap-[4px]'>

                        <label htmlFor="prep_time">
                          Prep Time
                        </label>

                        <select
                          as='select'
                          name="prep_time"
                          onChange={recipeFormik.handleChange}
                          onBlur={recipeFormik.handleBlur}
                          value={recipeFormik.values.prep_time}
                          className="border rounded-md p-1"
                          placeholder="Prep time"
                        >
                          <option value=''>Select Prep Time</option>
                          <option value='>5min'>🏃🏻💨 {'>'}5 min</option>
                          <option value='5-30 min'>⚡️ 5-30 min</option>
                          <option value='30-60 min'>⏲️ 30-60 min</option>
                          <option value='1-3 hr'>👩🏽‍🍳 1-3 hr</option>
                          <option value='All Day'>📆 All Day</option>
                        </select>

                        {recipeFormik.errors.prep_time && recipeFormik.touched.prep_time && (
                            <div className="text-shittake flex items-center">❌  {recipeFormik.errors.prep_time}</div>
                        )}



                      </div>

                      {/* Source Field */}
                      <div className='flex flex-col gap-[4px]'>

                        <label htmlFor="source">
                          Source
                        </label>

                        <input
                          type="text"
                          name="source"
                          onChange={recipeFormik.handleChange}
                          onBlur={recipeFormik.handleBlur}
                          value={recipeFormik.values.source}
                          className="border rounded-md p-1"
                          placeholder="Enter Source"
                        />
                        {recipeFormik.errors.source && recipeFormik.touched.source && (
                        <div className="text-shittake flex items-center">❌  {recipeFormik.errors.source}</div>
                        )}


                      </div>

                      {/* Img Upload Field */}
                      <div className='flex flex-col gap-[4px]'>

                        <label htmlFor="recipe_img">
                          Recipe Image
                        </label>

                        <Dropzone onDrop={acceptedFiles => {
                          setFiles(acceptedFiles.map(file => Object.assign(file, {
                            preview: URL.createObjectURL(file)
                          })));}
                        }>
                          {({getRootProps, getInputProps}) => (
                            <section>
                              <div {...getRootProps()}>
                                <input {...getInputProps()} />
                                <p className='bg-shittake border text-white p-2 rounded-lg'>

                                  <UploadFileIcon />
                                  Drag or Click Here

                                </p>
                              </div>
                            </section>
                          )}
                        </Dropzone>


                        {files[0] ?
                        <div className='flex flex-row justify-between bg-champagne p-2 m-2 rounded-lg '>

                          <div className='flex flex-row'>
                            <img alt='img_preview' src={files[0].preview} className='h-[50px] w-[50px]' />

                            <div className='flex flex-col'>
                              <p>{files[0].name}</p>
                              <p className='flex items-center text-sm'>{Math.round(files[0].size / 1024)} KB</p>


                            </div>

                          </div>


                          <div className='flex flex-col'>

                            <button
                              className='bg-shittake text-white rounded-lg p-1'
                              onClick={() => removeFile(files[0].name)}
                            >
                              Remove
                            </button>

                          </div>

                        </div>
                        :
                        <p className='pl-2'>No Img Uploaded</p>
                        }

                      </div>

                      {/* Instructions Field */}
                      <div className='flex flex-col gap-[4px]'>

                        <label htmlFor="instructions">
                          Instructions
                        </label>
                        <textarea
                          name="instructions"
                          as='textarea'
                          onChange={recipeFormik.handleChange}
                          onBlur={recipeFormik.handleBlur}
                          value={recipeFormik.values.instructions}
                          className="border rounded-md p-1 min-h-[150px]"
                          placeholder="Write instructions here..."
                        />

                        {recipeFormik.errors.instructions && recipeFormik.touched.instructions && (
                            <div className="text-shittake flex items-center">❌  {recipeFormik.errors.instructions}</div>
                        )}

                      </div>


                  </div>


                  {/* Form Submit */}
                  <div className='h-[4%] w-full flex items-end sm:mt-2'>
                    <button type ='submit' className="text-lg bg-champagne border border-black text-black hover:bg-transparent rounded-lg w-full">
                      Add Recipe
                    </button>
                  </div>

                </Form>
              </Formik>
            </div>
          )}

    </>
  );
}

export default GenerateRecipe;