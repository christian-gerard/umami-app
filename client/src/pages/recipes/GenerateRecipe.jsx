import { useState, useEffect } from "react";
import { useFormik, FieldArray, Formik, Field, Form } from "formik";
import toast from "react-hot-toast";
import { object, string, array, number, bool } from "yup";
import {OpenAI} from 'openai'
import StraightenIcon from '@mui/icons-material/Straighten';
import BlockIcon from '@mui/icons-material/Block';
import LocalGroceryStoreIcon from '@mui/icons-material/LocalGroceryStore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import Loading from '../../components/Loading'
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';

const openai = new OpenAI({

  apiKey: 'TESTING',
  dangerouslyAllowBrowser: true

})


function GenerateRecipe() {
  const [generatedRecipe, setgeneratedRecipe] = useState(null)
  const [isOpen, setIsOpen] = useState(false)
  const [isLoaded, setIsLoaded] = useState(true)
  const [isGenerated, setIsGenerated] = useState(true)

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

  const formik = useFormik({
    initialValues,
    validationSchema: recipeGenSchema,
    onSubmit: (formData) => {

      const response = openai.chat.completions.create({
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
              "steps":"",
              "notes": ""

            }

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

      })


    },
  });

  useEffect(() => {
    formik.resetForm()
    console.log('Page refresh')
  },[])

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
                <p className='h-[5%] text-lg tracking-wide'>Recipe Options</p>

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
                        <StraightenIcon  className=''/>
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
          <div className="h-[50%] w-full sm:h-full sm:w-[50%]">


          { isGenerated ?

            <>
            {
              generatedRecipe ?

              <div className='bg-champagne rounded-xl h-full'>
                {/* <h1 className='text-5xl bold m-2 tracking-wide'>
                  {generatedRecipe.name}
                </h1>
                <h2 className='text-shittake bold italic text-xl ml-2 mr-2 mb-6'>
                  { generatedRecipe.notes ?
                  <p> **{generatedRecipe.notes} </p>
                  :
                  <></>
                  }
                </h2>

                <p className='text-2xl bold mb-2'>{generatedRecipe.prep_time}</p>
                <p className='text-2xl bold mb-4'>{generatedRecipe.category}</p>
                <p className='text-3xl bold mb-2'>Ingredients</p>

                <div className='mb-6'>
                  {generatedRecipe.ingredients.map((ingredient) =>
                  <div className='flex flex-row m-2 '>
                    <h3 className='text-2xl'>{ingredient.name}  | </h3>
                    <p className="text-xl mr-4 ml-2">  {ingredient.amount}  </p>
                    <p className="text-xl bold italic ">{ingredient.measurement_unit}</p>

                  </div>) }
                </div>
                <p className='text-3xl bold mb-2'>Instructions</p>
                <div className='text-xl tracking-wide'>

                  {generatedRecipe.steps}
                </div> */}
              </div>
              :
              <div className='h-full flex flex-col items-center justify-center'>
                <p className='text-2xl sm:text-4xl bg-champagne rounded-xl p-2 flex text-center'>🍄 Input Recipe Options 🍄</p>
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

    </>
  );
}

export default GenerateRecipe;