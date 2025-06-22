number_words = {
    "zero": 0,
    "one": 1, "two": 2, "three": 3, "four": 4, "five": 5,
    "six": 6, "seven": 7, "eight": 8, "nine": 9, "ten": 10,
    "eleven": 11, "twelve": 12, "thirteen": 13, "fourteen": 14, "fifteen": 15,
    "sixteen": 16, "seventeen": 17, "eighteen": 18, "nineteen": 19, "twenty": 20,
    "twenty-one": 21, "twenty-two": 22, "twenty-three": 23, "twenty-four": 24, "twenty-five": 25,
    "twenty-six": 26, "twenty-seven": 27, "twenty-eight": 28, "twenty-nine": 29, "thirty": 30,
    "thirty-one": 31, "thirty-two": 32, "thirty-three": 33, "thirty-four": 34, "thirty-five": 35,
    "thirty-six": 36, "thirty-seven": 37, "thirty-eight": 38, "thirty-nine": 39, "forty": 40,
    "forty-one": 41, "forty-two": 42, "forty-three": 43, "forty-four": 44, "forty-five": 45,
    "forty-six": 46, "forty-seven": 47, "forty-eight": 48, "forty-nine": 49, "fifty": 50,
    "fifty-one": 51, "fifty-two": 52, "fifty-three": 53, "fifty-four": 54, "fifty-five": 55,
    "fifty-six": 56, "fifty-seven": 57, "fifty-eight": 58, "fifty-nine": 59, "sixty": 60,
    "sixty-one": 61, "sixty-two": 62, "sixty-three": 63, "sixty-four": 64, "sixty-five": 65,
    "sixty-six": 66, "sixty-seven": 67, "sixty-eight": 68, "sixty-nine": 69, "seventy": 70,
    "seventy-one": 71, "seventy-two": 72, "seventy-three": 73, "seventy-four": 74, "seventy-five": 75,
    "seventy-six": 76, "seventy-seven": 77, "seventy-eight": 78, "seventy-nine": 79, "eighty": 80,
    "eighty-one": 81, "eighty-two": 82, "eighty-three": 83, "eighty-four": 84, "eighty-five": 85,
    "eighty-six": 86, "eighty-seven": 87, "eighty-eight": 88, "eighty-nine": 89, "ninety": 90,
    "ninety-one": 91, "ninety-two": 92, "ninety-three": 93, "ninety-four": 94, "ninety-five": 95,
    "ninety-six": 96, "ninety-seven": 97, "ninety-eight": 98, "ninety-nine": 99, "hundred": 100,
    'thousand':1000
}


test_txt = "six hundred sixty-six thousand six hundred sixty-six"
test_txt2="twelve thousand twenty"
def split_text(txt):
    return txt.split(' ')

def getNumbers(txt):
    return [number_words[s] for s in split_text(txt)]

def combine_place(numbers):
        
    result = []
    for i in range(0,len(numbers),2):
        
        x = numbers[i]* numbers[i+1] if (i+1)%len(numbers) !=0 else numbers[i]
        result.append(x)
    return result



def getfinalNumber(combined_numbers):
    final_number =0
    for i, x in enumerate(combined_numbers[::-1]):
        if i > 0:
            
          dif = (2*(i)+1) - len(str(x))
        else:
            dif = 2-len(str(x))
        
        if(dif> 0):
            
            sum = int(str(x) + '0'*(dif-1))
            final_number += sum
            
        else:
          final_number+=x
    return final_number

def convertWordToNum(txt):
    numbers = getNumbers(txt)
    combinePlace = combine_place(numbers)
    return getfinalNumber(combinePlace)
    

tests = {
    "six hundred sixty-six thousand six hundred sixty-six": 666666,  # ✅ working
    "twelve thousand twenty": 12020,  # ❌ fails in your current logic
    "one thousand one": 1001,         # ❌
    "forty-two": 42,                  # ❌
    "ninety-nine": 99,                # ❌
    "one hundred five": 105,      # ❌ (if "and" is present)
    "two hundred": 200,               # ❌ (if only one pair)
    "seven": 7,                       # ❌ (lone number)
    "zero": 0,                        # ❌ (missing in number_words)

}


for w,n in tests.items():
    # print(w,n)
    num = convertWordToNum(w)
    if num == n:
        print(f'test passed for {n}')
    else:
        print(f'test failed for {n}: {num} ')