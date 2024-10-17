import { useState, useEffect } from "react";
import { useFormik, FieldArray, Formik, Field, Form } from "formik";
import toast from "react-hot-toast";
import { object, string, array, number } from "yup";
import {OpenAI} from 'openai'
import StraightenIcon from '@mui/icons-material/Straighten';
import BlockIcon from '@mui/icons-material/Block';
import LocalGroceryStoreIcon from '@mui/icons-material/LocalGroceryStore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import Loading from '../../components/Loading'

const openai = new OpenAI({

  apiKey: 'TESTING',
  dangerouslyAllowBrowser: true

})


function GenerateRecipe() {
  const [generatedRecipe, setgeneratedRecipe] = useState(null)
  const [isOpen, setIsOpen] = useState(false)
  const [isLoaded, setIsLoaded] = useState(true)

  const ingredientSearchSchema = object({
    settings: string(),
    ingredients: array().of(
      object({
        name: string(),
        amount: number(),
        measurement_unit: string(),
      }),
    ),
  });

  const initialValues = {
    added_ingredients: "",
    restrictions: "",
    strictness: "",
    ingredients: [
      {
        name: "",
        amount: "",
        measurement_unit: "",
      }
    ],
  };

  const formik = useFormik({
    initialValues,
    validationSchema: ingredientSearchSchema,
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
        setAiRecipes(parsedJson)

      })


    },
  });

  return (

    <>
    {
      isLoaded ?

      <div className="h-[92%] p-6 flex flex-col md:flex-row">
        <div className="bg-shittake text-black p-6 rounded-lg">
          <h2 className="text-4xl text-white">AI Generated Recipes</h2>

          <Formik initialValues={initialValues} onSubmit={formik.handleSubmit}>
            <Form
              className="flex flex-col mt-2 text-white"
              onSubmit={formik.handleSubmit}
            >

              <label htmlFor="settings" className='text-2xl mb-1'>
                <button type='button' onClick={() => setIsOpen(!isOpen)}>

                Settings {isOpen ? <ExpandLessIcon/> : <ExpandMoreIcon/>}

                </button>
              </label>

              { isOpen ?
                <>
                  <div className='m-2 flex flex-row justify-between items-center '>
                    <div>
                      <StraightenIcon  className='mr-2'/>
                      <label htmlFor="settings" className='text-lg'>Strictness</label>
                      <p className='text-sm'>Allow the model to get creative (1: Least Risky 10: Most Creative)</p>

                    </div>
                    <input
                      name={`strictness`}
                      value={
                        formik.values.strictness
                          ? formik.values.strictness
                          : ""
                      }
                      onChange={formik.handleChange}
                      type='number'
                      min='1'
                      max='10'
                      className='text-black h-[30px] text-lg rounded-lg p-1'
                    />

                  </div>

                  <div className='m-2 flex flex-row justify-between items-center '>
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
                      min='1'
                      max='10'
                      className='text-black h-[30px] text-lg rounded-lg p-1'
                    >
                      <option value=''>None</option>
                      <option value='vegetarian'>Vegetarian</option>
                      <option value='pescitarian'>Pescitarian</option>
                      <option value='peanut allergy'>Peanut Allergy</option>
                    </select>

                  </div>


                  <div className='m-2 flex flex-row justify-between items-center '>
                    <div>
                      <LocalGroceryStoreIcon  className='mr-2'/>
                      <label htmlFor="settings" className='text-lg'>Added Ingredients</label>
                      <p className='text-sm'>Allow the recipe to be generated with additonal ingredients not listed</p>

                    </div>
                    <input
                      name={`added_ingredients`}
                      value={
                        formik.values.added_ingredients
                          ? formik.values.added_ingredients
                          : ""
                      }
                      onChange={formik.handleChange}
                      type='checkbox'
                      className='text-black h-[30px] text-lg rounded-lg p-1'
                    />


                  </div>

                </>

              :
                <>
                </>
              }






              <label htmlFor="name" className='text-2xl'>Ingredients</label>

              <FieldArray name="ingredients" validateOnChange={true}>
                {(fieldArrayProps) => {
                  const { push, remove, form } = fieldArrayProps;
                  const { values } = form;
                  const ingredients = values.ingredients || [];

                  const handleAddIngredient = () => {
                    push({ name: "", amount: "", measurement: "" });
                  };

                  const handleDeleteIngredient = (index) => {

                    if (index !== 0) {

                      remove(index)
                      const updatedIngredients = [...formik.values.ingredients]
                      updatedIngredients.splice(index, 1)
                      formik.setFieldValue('ingredients',updatedIngredients)

                    }

                  }

                  return (
                    <div className='m-2'>
                      {ingredients.map((ingredient, index) => (
                        <div key={index} className="text-black text-nowrap">
                          <Field
                            name={`ingredients[${index}].name`}
                            value={
                              formik.values.ingredients[index]
                                ? formik.values.ingredients[index].name
                                : ""
                            }
                            onChange={formik.handleChange}
                            placeholder="Name"
                            className="m-1 p-1 rounded-lg w-[100px] md:w-[250px]"
                          />
                          <Field
                            name={`ingredients[${index}].amount`}
                            placeholder="#"
                            value={
                              formik.values.ingredients[index]
                                ? formik.values.ingredients[index].amount
                                : ""
                            }
                            onChange={formik.handleChange}
                            className="m-1 p-1 rounded-lg w-[40px]"
                          />
                          <Field
                            as='select'
                            name={`ingredients[${index}].measurement_unit`}
                            placeholder="Measurement"
                            value={
                              formik.values.ingredients[index]
                                ? formik.values.ingredients[index].measurement_unit
                                : ""
                            }
                            onChange={formik.handleChange}
                            className="m-1 p-1 rounded-lg w-[80px]"
                          >
                            <option value=''>Serving</option>
                            <option value='package'>Package</option>
                            <option value='pints'>Pint</option>
                            <option value='quarts'>Quart</option>
                            <option value='cups'>Cup</option>
                            <option value='oz'>Ounce</option>
                            <option value='fl oz'>Fluid Ounce</option>
                            <option value='tbsp'>Tablespoon</option>
                            <option value='tsp'>Teaspoon</option>
                          </Field>

                          <button
                            type="button"
                            onClick={() => handleDeleteIngredient(index)}
                            className="p-1 m-1 bg-champagne text-black w-[30px] rounded-lg"
                          >
                            −
                          </button>
                          <button
                            type="button"
                            onClick={handleAddIngredient}
                            className="p-1 m-1 w-[30px] bg-champagne text-black rounded-lg"
                          >
                            +
                          </button>
                        </div>
                      ))}
                    </div>
                  );
                }}
              </FieldArray>

              <button
                className="bg-champagne text-black rounded-lg mt-3 pt-1 pb-1"
                type="submit"
              >
                Search
              </button>
            </Form>
          </Formik>
        </div>

        <div className="border-1 w-[80%] justify-center m-4 ">


        { isLoading ?
          <div className='w-full h-full ml-12 flex justify-center items-center'>

            <h1 className='bold text-6xl mr-8'>
              LOADING
            </h1>

          <div role="status">
              <svg aria-hidden="true" class="w-[60px] h-[60px] text-champagne animate-spin dark:shittake fill-shittake" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor"/>
                  <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill"/>
              </svg>
              <span class="sr-only">Loading...</span>
          </div>

          </div>

          :

          <>

          {
            aiRecipes ?

            <div className='bg-champagne p-4 rounded-lg '>
              <h1 className='text-5xl bold m-2 tracking-wide'>
                {aiRecipes.name}
              </h1>
              <h2 className='text-shittake bold italic text-xl ml-2 mr-2 mb-6'>
                { aiRecipes.notes ?
                <p> **{aiRecipes.notes} </p>
                :
                <></>
                }
              </h2>

              <p className='text-2xl bold mb-2'>{aiRecipes.prep_time}</p>
              <p className='text-2xl bold mb-4'>{aiRecipes.category}</p>
              <p className='text-3xl bold mb-2'>Ingredients</p>

              <div className='mb-6'>
                {aiRecipes.ingredients.map((ingredient) =>
                <div className='flex flex-row m-2 '>
                  <h3 className='text-2xl'>{ingredient.name}  | </h3>
                  <p className="text-xl mr-4 ml-2">  {ingredient.amount}  </p>
                  <p className="text-xl bold italic ">{ingredient.measurement_unit}</p>

                </div>) }
              </div>
              <p className='text-3xl bold mb-2'>Instructions</p>
              <div className='text-xl tracking-wide'>

                {aiRecipes.steps}
              </div>
            </div>
            :
            <>
              <h1 className='text-2xl bg-champagne flex justify-center p-12 rounded-lg'> 🍄 </h1>
            </>
          }







          </>

        }
        </div>
      </div>

      :

      <Loading />



    }

    </>
  );
}

export default GenerateRecipe;